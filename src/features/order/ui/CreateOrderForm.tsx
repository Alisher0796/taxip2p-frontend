import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrderSchema } from '../lib/schema';
import { Input, Textarea } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button/Button';
import { useTelegram } from '@/shared/lib/hooks/useTelegram';

type FormData = {
  fromAddress: string;
  toAddress: string;
  price?: number;
  comment?: string;
};

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateOrderForm = ({ onSubmit, isLoading }: Props) => {
  const { showMainButton, hideMainButton } = useTelegram();
  
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
      showMainButton('Создать заказ', handleSubmit(onSubmit));
    } else {
      hideMainButton();
    }
    
    return () => hideMainButton();
  }, [isValid, formValues, showMainButton, hideMainButton, handleSubmit, onSubmit, isLoading]);

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
