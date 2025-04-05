import { useEffect } from 'react';
import { useSocket } from '@/app/providers/SocketProvider';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/entities/user/model/store';
import { useOrderStore } from '@/features/order/model/store';
import { api } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider/TelegramProvider';
import WebApp from '@twa-dev/sdk';
import type { Order, OrderStatus } from '@/shared/types/api';

// Функция для получения текста статуса
function getStatusText(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Ожидает водителя';
    case 'negotiating':
      return 'Обсуждение цены';
    case 'accepted':
      return 'Заказ принят';
    case 'inProgress':
      return 'Поездка началась';
    case 'completed':
      return 'Поездка завершена';
    case 'cancelled':
      return 'Заказ отменён';
    default:
      return 'Неизвестный статус';
  }
}

import { Chat } from '@/features/chat/ui/Chat';

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

export default function DriverActivePage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { currentOrder, setCurrentOrder } = useOrderStore();
  const { haptic, hideMainButton } = useTelegram();

  const { socket } = useSocket();

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/');
      return;
    }

    // Загружаем активный заказ
    api.getOrders('accepted').then((orders) => {
      const activeOrder = orders.find((order) => order.driver?.id === user.id);
      if (activeOrder) {
        setCurrentOrder(activeOrder);
      }
    });

    hideMainButton();
  }, [user, navigate, setCurrentOrder, hideMainButton]);

  useEffect(() => {
    if (!socket || !user) return;

    // Подписываемся на обновления заказа
    socket.on('order:updated', (updatedOrder: Order) => {
      if (updatedOrder.driver?.id === user.id) {
        setCurrentOrder(updatedOrder);

        // Если заказ отменен, перенаправляем на главную
        if (updatedOrder.status === 'cancelled') {
          navigate('/driver');
          WebApp.showPopup({
            title: 'Заказ отменен',
            message: 'Пассажир отменил заказ',
            buttons: [{ type: 'ok' }]
          });
          haptic.notification('error');
        }
      }
    });

    return () => {
      socket.off('order:updated');
    };
  }, [socket, user, navigate, setCurrentOrder, haptic]);

  const handleStartOrder = async () => {
    if (!currentOrder) return;

    try {
      WebApp.MainButton.showProgress();
      await api.updateOrder(currentOrder.id, { status: 'inProgress', startedAt: new Date().toISOString() });
      haptic.notification('success');
    } catch (error) {
      console.error('Failed to start order:', error);
      WebApp.showPopup({
        title: 'Ошибка',
        message: 'Не удалось начать поездку. Попробуйте еще раз.',
        buttons: [{ type: 'ok' }]
      });
      haptic.notification('error');
    } finally {
      WebApp.MainButton.hideProgress();
    }
  };

  const handleCompleteOrder = async () => {
    if (!currentOrder) return;

    try {
      WebApp.MainButton.showProgress();
      await api.updateOrder(currentOrder.id, { status: 'completed', completedAt: new Date().toISOString() });
      haptic.notification('success');
      navigate('/driver');
    } catch (error) {
      console.error('Failed to complete order:', error);
      WebApp.showPopup({
        title: 'Ошибка',
        message: 'Не удалось завершить поездку. Попробуйте еще раз.',
        buttons: [{ type: 'ok' }]
      });
      haptic.notification('error');
    } finally {
      WebApp.MainButton.hideProgress();
    }
  };

  if (!currentOrder) {
    return (
      <div className="p-4 text-center text-gray-500">
        Нет активного заказа
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold">Активный заказ</h2>
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

        <div>
          <h3 className="text-lg font-semibold">Статус</h3>
          <span className={`inline-flex rounded-full px-2 py-1 text-sm font-semibold ${getStatusClasses(currentOrder.status)}`}>
            {getStatusText(currentOrder.status)}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Пассажир</h3>
          <p className="text-gray-600 dark:text-gray-300">{currentOrder.passenger.username}</p>
        </div>

        {/* Показываем цены */}
        <div className="space-y-2">
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

        {/* Кнопки управления заказом */}
        {currentOrder.status === 'accepted' && (
          <button
            onClick={handleStartOrder}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
          >
            Начать поездку
          </button>
        )}

        {currentOrder.status === 'inProgress' && (
          <button
            onClick={handleCompleteOrder}
            className="w-full rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition-colors"
          >
            Завершить поездку
          </button>
        )}

        {/* Показываем чат */}
        <Chat orderId={currentOrder.id} />

        {/* Показываем время создания и обновления */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
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
