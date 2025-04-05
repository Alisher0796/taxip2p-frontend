import { Card, CardContent } from '@/shared/ui'
import type { Driver } from '../model/types'

interface DriverInfoProps {
  driver: Driver
  className?: string
}

export function DriverInfo({ driver, className }: DriverInfoProps) {
  return (
    <Card className={className}>
      <CardContent className="space-y-2 pt-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Driver:</span>
          <span>{driver.username || 'Anonymous'}</span>
        </div>
        {driver.carInfo && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Car:</span>
              <span>{driver.carInfo.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color:</span>
              <span>{driver.carInfo.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plate:</span>
              <span>{driver.carInfo.plateNumber}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
