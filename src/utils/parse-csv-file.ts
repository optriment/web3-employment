import Papa from 'papaparse'
import { ClientError } from '@/lib/clientError'

export const parseCsvFile = <T>(csvFile: File): Promise<T[]> =>
  new Promise<T[]>((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as T[]),
      error: (err) => reject(new ClientError(err.message, 500)),
    })
  })
