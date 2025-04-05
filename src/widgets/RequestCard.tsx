import { useState } from 'react';

import { useTelegram } from '@/app/providers/TelegramProvider/TelegramProvider';
import WebApp from '@twa-dev/sdk';
import type { Order } from '@/shared/types/api';

interface Props {
  order: Order;
  onAccept: () => Promise<void>;
  onMakeOffer: (price: number) => Promise<void>;
}

export function RequestCard({ order, onAccept, onMakeOffer }: Props) {
  const [price, setPrice] = useState<number | ''>('');
  const { haptic } = useTelegram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;

    try {
      WebApp.MainButton.showProgress();
      await onMakeOffer(Number(price));
      setPrice('');
      haptic.notification('success');
      WebApp.showPopup({
        title: 'Успех',
        message: 'Ваше предложение отправлено',
        buttons: [{ type: 'ok' }]
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
      haptic.notification('error');
      WebApp.showPopup({
        title: 'Ошибка',
        message: 'Не удалось отправить предложение. Попробуйте еще раз.',
        buttons: [{ type: 'ok' }]
      });
    } finally {
      WebApp.MainButton.hideProgress();
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="mb-4 space-y-2">
        <div>
          <h3 className="text-lg font-semibold">Откуда</h3>
          <p className="text-gray-600 dark:text-gray-300">{order.fromAddress}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Куда</h3>
          <p className="text-gray-600 dark:text-gray-300">{order.toAddress}</p>
        </div>
        
        {order.price && (
          <div>
            <h3 className="text-lg font-semibold">Цена</h3>
            <p className="text-gray-600 dark:text-gray-300">{order.price} TL</p>
          </div>
        )}
        
        {order.comment && (
          <div>
            <h3 className="text-lg font-semibold">Комментарий</h3>
            <p className="text-gray-600 dark:text-gray-300">{order.comment}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex gap-2">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
            placeholder="Ваша цена"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
            min={1}
            max={10000}
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
          >
            Предложить
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        Создан: {new Date(order.createdAt).toLocaleString()}
      </div>

      <button
        onClick={async () => {
          try {
            WebApp.MainButton.showProgress();
            await onAccept();
            haptic.notification('success');
          } catch (error) {
            console.error('Failed to accept order:', error);
            haptic.notification('error');
            WebApp.showPopup({
              title: 'Ошибка',
              message: 'Не удалось принять заказ. Попробуйте еще раз.',
              buttons: [{ type: 'ok' }]
            });
          } finally {
            WebApp.MainButton.hideProgress();
          }
        }}
        className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-700 dark:hover:bg-green-600"
      >
        Принять заказ
      </button>
    </div>
  );
}
