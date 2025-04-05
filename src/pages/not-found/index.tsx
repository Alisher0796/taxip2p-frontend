import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">Страница не найдена</p>
      <Link to="/">
        <Button variant="primary">На главную</Button>
      </Link>
    </div>
  );
}
