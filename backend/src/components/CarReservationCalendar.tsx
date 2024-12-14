import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import * as BookingService from '@/services/BookingService'
import * as bookcarsTypes from ':bookcars-types'
import * as helper from '@/common/helper'

interface CarReservationCalendarProp {
    suppliers: string[] | undefined
    statuses: string[] | undefined
    user?: bookcarsTypes.User
    car?: string
    filter?: bookcarsTypes.Filter | null
}

interface Event {
  id: number;
  title: string;
  url: string; // Assurez-vous que l'URL est définie ici
}

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    url: string;
    className: string;
  }

const CarReservationCalendar = ({ car, suppliers, statuses, filter, user } : CarReservationCalendarProp) => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [open, setOpen] = React.useState(false) // State pour gérer l'ouverture du modal
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null)

  // Fonction pour ouvrir le modal
  const handleClickOpen = (event: any) => {
    setSelectedEvent(event) // Enregistrer l'événement sélectionné
    setOpen(true) // Ouvrir le modal
  }

  // Fonction pour fermer le modal
  const handleClose = () => {
    setOpen(false)
  }

  // Fonction pour confirmer et ouvrir l'URL dans un nouvel onglet
  const handleConfirm = () => {
    if (selectedEvent && selectedEvent.url) {
      window.open(selectedEvent.url, '_blank')
    }
    setOpen(false)
  }

    const fetchBookings = async (start: Date, end: Date) => {
      const adjustedStart = new Date(start)
      adjustedStart.setMonth(adjustedStart.getMonth() - 1) // Soustraire un mois

      const adjustedEnd = new Date(end)
      adjustedEnd.setMonth(adjustedEnd.getMonth() + 1) // Ajouter un mois
      filter = { from: adjustedStart, to: adjustedEnd }
      try {
        const payload: bookcarsTypes.GetBookingsPayload = {
          suppliers,
          statuses,
          filter: filter || undefined,
          car,
          user: (user && user._id) || undefined,
        }

        const bookings = await BookingService.getBookings(payload, 1, 100)
        if (bookings && bookings[0] && bookings[0].resultData) {
          const formattedEvents: CalendarEvent[] = bookings[0].resultData.map((booking) => ({
            title: helper.getBookingStatus(booking.status),
            start: booking.from,
            end: booking.to,
            url: `update-booking?b=${booking._id}`,
            className: `bs-${booking.status}`,
          }))
          setEvents(formattedEvents)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations :', error)
      }
    }

  const handleDatesSet = (dates: { startStr: Date; endStr: Date }) => {
    // Appelez fetchBookings avec les dates visibles
    fetchBookings(dates.startStr, dates.endStr)
  }

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, multiMonthPlugin, timeGridPlugin]}
        initialView="multiMonthYear"
        views={{
          multiMonthYear: {
            type: 'multiMonth',
            duration: { months: 2 },
            multiMonthMaxColumns: 2,
          },
          dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'long' },
          },
        }}
        height="auto"
        headerToolbar={{
          end: 'prev,next',
          center: 'title',
          start: 'today',
        }}
        buttonText={{
          today: "Aujourd'hui",
        }}
        locale="fr"
        events={events}
        eventDisplay="block"
        eventClick={(info) => {
          info.jsEvent.preventDefault()
          handleClickOpen(info.event)
        }}
        datesSet={(info) => handleDatesSet(info)} // Capture les dates visibles
      />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmer l&apos;ouverture de la réservation ?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir ouvrir la page de réservation dans un nouvel onglet ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleConfirm} autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CarReservationCalendar
