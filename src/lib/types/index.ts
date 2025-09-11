import type { RecordType } from '#/lib/enum/enum.record-type'

type AppRecordMark = {
  text: string
}

export type AppRecord = {
  id: string | number
  marks: AppRecordMark[]
  type: RecordType
  login: string
  password: string
}

export type ExtendedAppRecord = AppRecord & {
  rawMark?: string
}
