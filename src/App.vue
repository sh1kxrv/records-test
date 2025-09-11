<script setup lang="ts">
import { Button, Message, Select, InputText, Password } from 'primevue'
import { useRecordsStore } from '#/lib/store/store.records'
import { storeToRefs } from 'pinia'
import { RecordType } from '#/lib/enum/enum.record-type'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import z from 'zod'

const store = useRecordsStore()

const { records } = storeToRefs(store)

const resolver = zodResolver(
  z
    .object({
      rawMark: z.optional(z.string().max(50)),
      type: z.enum([RecordType.LDAP, RecordType.Local]),
      login: z.string().max(100).min(1),
      password: z.string().max(100).min(1).optional(),
    })
    .superRefine(({ password, type }, ctx) => {
      if (type === RecordType.Local && !password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Пароль не может быть пустым',
        })
      }
    }),
)

const onChangeInput = (id: number | string) => {
  const submitBtn = document.getElementById(`submit-${id}`)
  if (submitBtn) {
    submitBtn.click()
  }
}

const onSubmit = ({ valid, values }: FormSubmitEvent, id: number | string) => {
  if (!values) values = records.value.find((x) => x.id === id)!
  if (valid) {
    store.updateRecord({
      id,
      login: values.login,
      password: values.type === RecordType.Local ? values.password : null,
      rawMark: values.rawMark,
      type: values.type,
    })
  }
}

store.loadRecords()
</script>

<template>
  <main>
    <header :class="$style.header">
      <h1 :class="$style.header__title">Учетные записи</h1>
      <Button @click="store.addEmptyRecord">
        <i class="pi pi-plus"></i>
      </Button>
    </header>
    <div :class="$style.content">
      <Message severity="secondary" icon="pi pi-question-circle">
        Для указании нескольких меток для одной пары логин/пароль используйте разделитель ;.
      </Message>
      <div :class="$style.content__grid">
        <p :class="$style.content__head">Метки</p>
        <p :class="$style.content__head">Тип записи</p>
        <p :class="$style.content__head">Логин</p>
        <p :class="$style.content__head">Пароль</p>
      </div>
      <Form
        v-slot="$form"
        v-for="record of records"
        :initial-values="record"
        :key="record.id"
        :resolver="resolver"
        validate-on-blur
        validate-on-mount
        validate-on-value-update
        :class="$style.content__form"
        @submit="($event) => onSubmit($event, record.id)"
      >
        <div :class="$style.content__grid">
          <InputText placeholder="Введите метку" name="rawMark" @input="onChangeInput(record.id)" />

          <Select
            name="type"
            @change="onChangeInput(record.id)"
            option-label="label"
            fluid
            option-value="value"
            :options="[
              { label: 'LDAP', value: RecordType.LDAP },
              { label: 'Локальный', value: RecordType.Local },
            ]"
          />
          <InputText
            @input="onChangeInput(record.id)"
            name="login"
            :invalid="$form.login?.invalid"
            fluid
            placeholder="Введите логин"
          />
          <Password
            v-if="$form.type?.value === RecordType.Local"
            name="password"
            @input="onChangeInput(record.id)"
            fluid
            placeholder="Введите пароль"
            :feedback="false"
            :invalid="!!$form.password?.invalid"
            toggle-mask
          />
          <span v-else></span>
          <Button icon="pi pi-trash" severity="danger" @click="store.removeRecord(record)" />
          <Button type="submit" style="display: none" :id="`submit-${record.id}`" />
        </div>
      </Form>
    </div>
  </main>
</template>

<style module lang="scss">
.header {
  display: flex;
  align-items: center;
  gap: 0 16px;
  &__title {
    font-size: 24px;
    line-height: 36px;
  }
}

.content {
  &__form {
    width: 100%;
  }
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 40px;
    gap: 12px 16px;
    margin-top: 12px;
  }
  &__head {
    opacity: 0.5;
    padding: 0;
    margin: 0;
    margin-top: 8px !important;
  }
}
</style>
