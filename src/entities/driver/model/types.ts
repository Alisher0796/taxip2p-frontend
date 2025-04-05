export interface Driver {
  id: string
  username?: string
  carInfo?: {
    model: string
    color: string
    plateNumber: string
  }
}
