import type { ExtendedAppRecord } from '#/lib/types'
import { defineStore } from 'pinia'
import { RecordType } from '#/lib/enum/enum.record-type'
import { ref } from 'vue'

const RECORD_STORAGE_KEY = 'records'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<ExtendedAppRecord[]>([])

  function loadRecords() {
    const raw = localStorage.getItem(RECORD_STORAGE_KEY)
    if (raw) {
      records.value = JSON.parse(raw)
      records.value.forEach((r) => {
        r.rawMark = r.marks.map((m) => m.text).join(';')
      })
    }
  }

  function saveRecords() {
    const parsedMarks = records.value.map((r) => getMarks(r.rawMark))
    records.value.forEach((r, i) => {
      r.marks = parsedMarks[i]
      delete r.rawMark
    })
    localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(records.value))
  }

  function addRecord(record: ExtendedAppRecord) {
    const marks = getMarks(record.rawMark)
    record.marks = marks
    records.value.push(record)
  }

  function removeRecord(record: ExtendedAppRecord) {
    records.value = records.value.filter((r) => r.id !== record.id)
    saveRecords()
  }

  function getMarks(rawMark?: string) {
    if (!rawMark) return []
    return rawMark.split(';').map((m) => ({ text: m.trim() }))
  }

  function updateRecord(record: Omit<ExtendedAppRecord, 'marks'>) {
    const index = records.value.findIndex((r) => r.id === record.id)
    if (index !== -1) {
      records.value[index] = {
        ...record,
        marks: getMarks(record.rawMark),
      }
    }
    saveRecords()
  }

  function addEmptyRecord() {
    addRecord({
      id: Date.now(),
      login: '',
      marks: [],
      password: '',
      type: RecordType.LDAP,
      rawMark: '',
    })
  }

  return {
    records,

    loadRecords,
    saveRecords,
    updateRecord,

    addRecord,
    removeRecord,
    addEmptyRecord,
  }
})
