import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import WebApp from '@twa-dev/sdk';
import { createOrderSchema } from '../lib/schema';
import { Input, Textarea } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button/Button';
import { useTelegram } from '@/app/providers/TelegramProvider';
import { PickupTime } from '@/shared/types/api';

type FormData = {
  fromAddress: string;
  toAddress: string;
  pickupTime: PickupTime;
  price?: number;
  comment?: string;
};

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateOrderForm = ({ onSubmit, isLoading }: Props) => {
  const { showMainButton, hideMainButton, haptic } = useTelegram();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(createOrderSchema),
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    if (isValid && !isLoading) {
      showMainButton();
      WebApp.MainButton.setText('Создать заказ');
      const handleClick = handleSubmit(async (data) => {
        try {
          WebApp.MainButton.showProgress();
          await onSubmit(data);
          haptic?.notification('success');
        } catch (error) {
          console.error('Failed to submit form:', error);
          WebApp.showPopup({
            title: 'Ошибка',
            message: 'Не удалось создать заказ. Попробуйте еще раз.',
            buttons: [{ type: 'ok' }]
          });
          haptic?.notification('error');
        } finally {
          WebApp.MainButton.hideProgress();
        }
      });
      WebApp.MainButton.onClick(handleClick);
    } else {
      hideMainButton();
    }
    
    return () => {
      hideMainButton();
      WebApp.MainButton.offClick(() => {});
    };
  }, [isValid, formValues, showMainButton, hideMainButton, handleSubmit, onSubmit, isLoading, haptic]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          label="Откуда"
          error={errors.fromAddress?.message}
          {...register('fromAddress')}
        />
      </div>

      <div>
        <Input
          label="Куда"
          error={errors.toAddress?.message}
          {...register('toAddress')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Время подачи
        </label>
        <select
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          {...register('pickupTime')}
        >
          <option value="MINS_15">Через 15 минут</option>
          <option value="MINS_30">Через 30 минут</option>
          <option value="HOUR_1">Через 1 час</option>
        </select>
        {errors.pickupTime && (
          <p className="mt-1 text-sm text-red-600">{errors.pickupTime.message}</p>
        )}
      </div>

      <div>
        <Input
          type="number"
          label="Цена (опционально)"
          error={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
      </div>

      <div>
        <Textarea
          label="Комментарий (опционально)"
          error={errors.comment?.message}
          {...register('comment')}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isValid || isLoading}
        >
          Создать
        </Button>
      </div>
    </form>
  );
};

CreateOrderForm.displayName = 'CreateOrderForm';
