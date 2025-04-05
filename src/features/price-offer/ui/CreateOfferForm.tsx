import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOfferSchema } from '../lib/schema';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import { useTelegram } from '@/shared/lib/hooks/useTelegram';

interface FormData {
  price: number;
}

interface Props {
  currentPrice: number;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreateOfferForm = ({
  currentPrice,
  onSubmit,
  onCancel,
  isLoading,
}: Props) => {
  const { showMainButton, hideMainButton } = useTelegram();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(createOfferSchema),
    mode: 'onChange',
    defaultValues: {
      price: currentPrice,
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (isValid && !isLoading) {
      showMainButton('Предложить цену', handleSubmit(onSubmit));
    } else {
      hideMainButton();
    }
    
    return () => hideMainButton();
  }, [isValid, formValues, showMainButton, hideMainButton, handleSubmit, onSubmit, isLoading]);

  return (
    <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <p className="text-sm text-gray-500">Текущая цена</p>
        <p className="text-lg font-bold">{currentPrice} ₺</p>
      </div>

      <Input
        type="number"
        label="Ваше предложение (TRY)"
        placeholder="Введите сумму"
        error={errors.price?.message}
        {...register('price', { valueAsNumber: true })}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!isValid || isLoading}
        >
          Предложить
        </Button>
      </div>
    </form>
  );
};

CreateOfferForm.displayName = 'CreateOfferForm';
