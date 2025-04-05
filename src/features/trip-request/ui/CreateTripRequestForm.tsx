import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripRequestSchema } from '../lib/schema';
import { Input, Textarea } from '@/shared/ui/Input/Input';
import { Select } from '@/shared/ui/Select/Select';
import { useTelegram } from '@/shared/lib/hooks/useTelegram';

type FormData = {
  fromAddress: string;
  toAddress: string;
  desiredPrice: number;
  pickupTime: 'PT15M' | 'PT30M' | 'PT1H';
  comment?: string;
};

const pickupTimeOptions = [
  { value: 'PT15M', label: 'Через 15 минут' },
  { value: 'PT30M', label: 'Через 30 минут' },
  { value: 'PT1H', label: 'Через 1 час' },
];

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateTripRequestForm = ({ onSubmit, isLoading }: Props) => {
  const { showMainButton, hideMainButton } = useTelegram();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(tripRequestSchema),
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    if (isValid) {
      showMainButton('Создать заявку', handleSubmit(onSubmit));
    } else {
      hideMainButton();
    }
    
    return () => hideMainButton();
  }, [isValid, formValues, showMainButton, hideMainButton, handleSubmit, onSubmit]);

  return (
    <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Откуда"
        placeholder="Введите адрес отправления"
        error={errors.fromAddress?.message}
        disabled={isLoading}
        {...register('fromAddress')}
      />
      
      <Input
        label="Куда"
        placeholder="Введите адрес назначения"
        error={errors.toAddress?.message}
        disabled={isLoading}
        {...register('toAddress')}
      />
      
      <Input
        type="number"
        label="Желаемая цена (TRY)"
        placeholder="Введите сумму"
        error={errors.desiredPrice?.message}
        disabled={isLoading}
        {...register('desiredPrice', { valueAsNumber: true })}
      />
      
      <Select
        label="Время подачи"
        options={pickupTimeOptions}
        error={errors.pickupTime?.message}
        disabled={isLoading}
        {...register('pickupTime')}
      />
      
      <Textarea
        label="Комментарий"
        placeholder="Дополнительная информация для водителя"
        error={errors.comment?.message}
        disabled={isLoading}
        {...register('comment')}
      />
    </form>
  );
};
