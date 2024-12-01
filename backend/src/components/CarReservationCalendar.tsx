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
  const [selectedEvent, setSelectedEvent] = React.useState(null) // L'événement sélectionné

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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const payload: bookcarsTypes.GetBookingsPayload = {
            suppliers,
            statuses,
            filter: filter || undefined,
            car,
            user: (user && user._id) || undefined,
          }
        const bookings = await BookingService.getBookings(payload, 1, 100) // Récupérer toutes les réservations pour la voiture
        if (bookings && bookings[0] && bookings[0].resultData) {
            const formattedEvents: CalendarEvent[] = bookings[0].resultData.map((booking) => ({
                title: helper.getBookingStatus(booking.status), // Vous pouvez personnaliser le titre
                start: booking.from,
                end: booking.to,
                url: `update-booking?b=${booking._id}`,
                className: `bs-${booking.status}`
                // ... autres propriétés d'événement si nécessaire
              }))
              setEvents(formattedEvents)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations :', error)
      }
    }

    fetchBookings()
  }, [car, suppliers, statuses, filter, user])

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, multiMonthPlugin, timeGridPlugin]} // Active les plugins nécessaires
        initialView="multiMonthYear" // Utilise la vue multi-mois
        views={{
            multiMonthYear: {
            type: 'multiMonth',
            duration: { months: 2 }, // Affiche 2 mois
            multiMonthMaxColumns: 2, // Dispose les mois côte à côte
            },
            dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }, // Format du titre pour chaque mois
            }
        }}
        height="auto" // Adjust height
        headerToolbar={{
            end: 'prev,next', // Navigation buttons
            center: 'title', // Calendar title
            start: 'today', // View options
        }}
        buttonText={{
            today: "Aujourd'hui", // Texte personnalisé pour "Today"
        }}
        locale="fr"
        events={events}
        eventDisplay="block" // Affiche les événements comme des blocs colorés
        eventClick={(info) => {
            // Empêche le comportement par défaut pour les liens
            info.jsEvent.preventDefault()
            handleClickOpen(info.event)
          }}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer l&apos;ouverture de la réservation ?
        </DialogTitle>
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
