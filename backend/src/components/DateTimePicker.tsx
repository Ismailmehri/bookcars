import React, { useEffect, useState } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { fr, enUS } from 'date-fns/locale'
import { TextFieldVariants } from '@mui/material'
import { DateTimeValidationError, PickersActionBarAction, DateOrTimeView } from '@mui/x-date-pickers'

interface DateTimePickerProps {
  value?: Date;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  language?: string;
  variant?: TextFieldVariants;
  readOnly?: boolean;
  showClear?: boolean;
  showTime?: boolean; // Nouvelle prop pour afficher/masquer l'heure
  format?: string;
  onChange?: (value: Date | null) => void;
  onError?: (error: DateTimeValidationError, value: Date | null) => void;
}

const DateTimePicker = ({
  value: dateTimeValue,
  label,
  minDate,
  maxDate,
  required,
  variant,
  language,
  readOnly,
  showClear,
  showTime = true, // Valeur par défaut : true (afficher l'heure)
  format,
  onChange,
  onError,
}: DateTimePickerProps) => {
  const [value, setValue] = useState<Date | null>(null)

  useEffect(() => {
    setValue(dateTimeValue || null)
  }, [dateTimeValue])

  const actions: PickersActionBarAction[] = ['accept', 'cancel']

  if (showClear) {
    actions.push('clear')
  }

  // Définir les vues en fonction de showTime
  const views: DateOrTimeView[] = showTime
    ? ['year', 'month', 'day', 'hours', 'minutes'] // Inclure l'heure
    : ['year', 'month', 'day'] // Exclure l'heure

  const resolvedFormat = format || (showTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy')

  return (
    <LocalizationProvider adapterLocale={language === 'fr' ? fr : enUS} dateAdapter={AdapterDateFns}>
      <MuiDateTimePicker
        label={label}
        value={value}
        readOnly={readOnly}
        views={views} // Utiliser les vues définies
        format={resolvedFormat}
        onChange={(_value) => {
          setValue(_value)

          if (onChange) {
            onChange(_value)
          }

          if (_value && minDate) {
            const val = new Date(_value)
            val.setHours(0, 0, 0, 0)
            const min = new Date(minDate)
            min.setHours(0, 0, 0, 0)

            if (val < min && onError) {
              onError('minDate', _value)
            }
          }
        }}
        onError={onError}
        minDate={minDate}
        maxDate={maxDate}
        timeSteps={{ hours: 1, minutes: 5 }}
        slotProps={{
          textField: {
            variant: variant || 'standard',
            required,
          },
          actionBar: {
            actions,
          },
        }}
      />
    </LocalizationProvider>
  )
}

export default DateTimePicker
