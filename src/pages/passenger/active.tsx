import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/entities/user/model/store';
import { useOrderStore } from '@/features/order/model/store';
import { api } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider/TelegramProvider';
import WebApp from '@twa-dev/sdk';
import type { Order, OrderStatus } from '@/shared/types/api';
import { useSocket } from '@/app/providers/SocketProvider';
import { OffersList } from '@/features/order/ui/OffersList';
import { Chat } from '@/features/chat/ui/Chat';

// Функция для получения текста статуса
function getStatusText(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Ожидает водителя';
    case 'negotiating':
      return 'Обсуждение цены';
    case 'accepted':
      return 'Водитель принял заказ';
    case 'inProgress':
      return 'Водитель в пути';
    case 'completed':
      return 'Поездка завершена';
    case 'cancelled':
      return 'Заказ отменён';
    default:
      return 'Неизвестный статус';
  }
}

// Функция для получения классов статуса
function getStatusClasses(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'negotiating':
      return 'bg-blue-100 text-blue-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'inProgress':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function ActiveOrderPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { currentOrder, setCurrentOrder } = useOrderStore();
  const { showBackButton, hideBackButton, haptic, hideMainButton } = useTelegram();
  const { socket } = useSocket();

  useEffect(() => {
    if (!user || user.role !== 'passenger') {
      navigate('/');
      return;
    }

    // Загружаем активный заказ
    api.getOrders('pending').then((orders) => {
      const activeOrder = orders.find((order) => order.passenger.id === user.id);
      if (activeOrder) {
        setCurrentOrder(activeOrder);
      } else {
        navigate('/passenger');
      }
    });

    hideMainButton();
  }, [user, navigate, setCurrentOrder, hideMainButton]);

  useEffect(() => {
    if (!socket || !user) return;

    // Подписываемся на обновления заказа
    socket.on('order:updated', (updatedOrder: Order) => {
      if (updatedOrder.id === currentOrder?.id) {
        setCurrentOrder(updatedOrder);

        // Уведомляем о начале поездки
        if (updatedOrder.status === 'inProgress') {
          WebApp.showPopup({
            title: 'Поездка началась',
            message: 'Водитель начал поездку',
            buttons: [{ type: 'ok' }]
          });
          haptic.notification('success');
        }

        // Уведомляем о завершении поездки
        if (updatedOrder.status === 'completed') {
          WebApp.showPopup({
            title: 'Поездка завершена',
            message: 'Водитель завершил поездку',
            buttons: [{ type: 'ok' }]
          });
          haptic.notification('success');
          navigate('/passenger');
        }
      }
    });

    return () => {
      socket.off('order:updated');
    };
  }, [socket, user, navigate, setCurrentOrder, haptic]);

  useEffect(() => {
    if (!user || user.role !== 'passenger') {
      navigate('/');
      return;
    }

    if (!currentOrder) {
      navigate('/passenger');
      return;
    }

    // Показываем кнопку "Назад"
    showBackButton();
    WebApp.BackButton.onClick(() => navigate('/passenger'));

    // Очистка при размонтировании
    return () => {
      hideBackButton();
      WebApp.BackButton.offClick(() => {});
    };
  }, [user, currentOrder, navigate, showBackButton, hideBackButton]);

  const handleCancel = async () => {
    try {
      WebApp.MainButton.showProgress();
      if (!currentOrder) return;
      await api.updateOrder(currentOrder.id, { status: 'cancelled' });
      haptic.notification('success');
      setCurrentOrder(null);
      navigate('/passenger');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      WebApp.showPopup({
        title: 'Ошибка',
        message: 'Не удалось отменить заказ',
        buttons: [{ type: 'ok' }]
      });
      haptic.notification('error');
    } finally {
      WebApp.MainButton.hideProgress();
    }
  };

  if (!currentOrder) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Активный заказ</h1>
      
      <div className="space-y-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <div className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Статус: {getStatusText(currentOrder.status)}
        </div>
        <div>
          <h3 className="text-lg font-semibold">Откуда</h3>
          <p className="text-gray-600 dark:text-gray-300">{currentOrder.fromAddress}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Куда</h3>
          <p className="text-gray-600 dark:text-gray-300">{currentOrder.toAddress}</p>
        </div>
        
        {currentOrder.price && (
          <div>
            <h3 className="text-lg font-semibold">Цена</h3>
            <p className="text-gray-600 dark:text-gray-300">{currentOrder.price} TL</p>
          </div>
        )}
        
        {currentOrder.comment && (
          <div>
            <h3 className="text-lg font-semibold">Комментарий</h3>
            <p className="text-gray-600 dark:text-gray-300">{currentOrder.comment}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold">Статус</h3>
          <span className={`inline-flex rounded-full px-2 py-1 text-sm font-semibold ${getStatusClasses(currentOrder.status)}`}>
            {getStatusText(currentOrder.status)}
          </span>
        </div>
        
        {/* Показываем кнопку отмены только для определенных статусов */}
        {(currentOrder.status === 'pending' || currentOrder.status === 'negotiating') && (
          <button
            onClick={handleCancel}
            className="w-full rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
          >
            Отменить заказ
          </button>
        )}

        {/* Показываем информацию о водителе, если он назначен */}
        {currentOrder.driver && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Водитель</h3>
            <p className="text-gray-600 dark:text-gray-300">{currentOrder.driver.username}</p>
          </div>
        )}

        {/* Показываем цены */}
        <div className="mt-4 space-y-2">
          {currentOrder.price && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Предложенная цена:</span>
              <span className="font-semibold">{currentOrder.price} TL</span>
            </div>
          )}
          {currentOrder.finalPrice && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Финальная цена:</span>
              <span className="font-semibold text-green-600">{currentOrder.finalPrice} TL</span>
            </div>
          )}
        </div>

        {/* Показываем предложения водителей */}
        {currentOrder.status === 'pending' && (
          <OffersList orderId={currentOrder.id} />
        )}

        {/* Показываем чат после принятия заказа */}
        {currentOrder.status !== 'pending' && (
          <Chat orderId={currentOrder.id} />
        )}

        {/* Показываем время создания и обновления */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Создан: {new Date(currentOrder.createdAt).toLocaleString()}</p>
          {currentOrder.startedAt && (
            <p>Начат: {new Date(currentOrder.startedAt).toLocaleString()}</p>
          )}
          {currentOrder.completedAt && (
            <p>Завершен: {new Date(currentOrder.completedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
