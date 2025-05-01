import React, { useState, useEffect } from 'react'
import {
  Typography,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Rating,
  Container,
  Box,
  Grid,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import * as bookcarsTypes from ':bookcars-types'
import * as UserService from '@/services/UserService'
import * as BookingService from '@/services/BookingService'
import * as helper from '@/common/helper'
import Layout from '@/components/Layout'
import Avatar from '@/components/Avatar'
import Backdrop from '@/components/SimpleBackdrop'
import { strings as commonStrings } from '@/lang/common'

import '@/assets/css/review.css'

const DriverReviewPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const userId = queryParams.get('u')
  const bookingId = queryParams.get('b')

  const [user, setUser] = useState<bookcarsTypes.User | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState<number | null>(null)
  const [comments, setComments] = useState<string>('')
  const [rentedCar, setRentedCar] = useState<string>('')
  const [answeredCall, setAnsweredCall] = useState<string>('')
  const [canceledLastMinute, setCanceledLastMinute] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<bookcarsTypes.User | null>(null)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [isValidBooking, setIsValidBooking] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success')

  // Gestion des erreurs par champ
  const [errors, setErrors] = useState({
    rating: false,
    comments: false,
    rentedCar: false,
    answeredCall: false,
    canceledLastMinute: false,
  })

  const handleError = (message: string) => {
    setToastMessage(message)
    setToastSeverity('error')
    setToastOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId || !bookingId) {
          handleError(commonStrings.MISSING_USER_OR_BOOKING)
          setLoading(false)
          return
        }

        const driver = await UserService.getUser(userId) as bookcarsTypes.User
        if (!driver) {
          handleError(commonStrings.DRIVER_NOT_FOUND)
          setLoading(false)
          return
        }
        setUser(driver)

        const _booking = await BookingService.getBooking(bookingId) as bookcarsTypes.Booking
        if (!_booking || !_booking._id) {
          handleError(commonStrings.BOOKING_NOT_FOUND)
          setLoading(false)
          return
        }
        _booking.supplier = _booking.supplier as bookcarsTypes.User
        _booking.driver = _booking.driver as bookcarsTypes.User

        const _currentUser = UserService.getCurrentUser()
        setCurrentUser(_currentUser)
        const connectedUser = await UserService.getUser(_currentUser?._id)
        const admin = connectedUser ? helper.admin(connectedUser) : false

        if (
          (_currentUser && _booking && _booking.driver && _booking.supplier._id === _currentUser._id && driver?._id === _booking.driver._id)
          || admin
        ) {
          setIsValidBooking(true)
        } else {
          handleError(commonStrings.BOOKING_NOT_ASSOCIATED)
        }

        const existingReview = driver.reviews?.find((review) => review.booking === bookingId && review.user === _currentUser?._id)
        if (existingReview && !admin) {
          setSubmitted(true)
          handleError(commonStrings.REVIEW_ALREADY_SUBMITTED)
        }

        setLoading(false)
      } catch {
        handleError(commonStrings.GENERIC_ERROR_MESSAGE)
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, bookingId])

  const handleGoHome = () => {
    navigate('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation par champ
    const newErrors = {
      rating: !rating,
      comments: rating !== null && rating < 3 && !comments,
      rentedCar: !rentedCar,
      answeredCall: !answeredCall,
      canceledLastMinute: !canceledLastMinute,
    }
    setErrors(newErrors)

    if (Object.values(newErrors).some(Boolean)) {
      setIsSubmitting(false)
      return
    }

    try {
      const review: bookcarsTypes.Review = {
        booking: bookingId!,
        user: currentUser && currentUser._id ? currentUser._id : '',
        type: currentUser && currentUser.type ? currentUser.type : 'plany',
        rating: rating || 5,
        comments,
        rentedCar: rentedCar === 'Oui',
        answeredCall: answeredCall === 'Oui',
        canceledLastMinute: canceledLastMinute === 'Oui',
        createdAt: new Date(),
      }

      if (user) {
        const data: bookcarsTypes.AddReviewPayload = {
          _id: user._id as string,
          review,
        }
        const status = await UserService.addReview(data)

        if (status === 200) {
          setUser(user)
          setSubmitted(true)
          setToastMessage(commonStrings.THANK_YOU)
          setToastSeverity('success')
          setToastOpen(true)
        }
      }
    } catch {
      handleError(commonStrings.SUBMIT_REVIEW_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <Backdrop text={commonStrings.PLEASE_WAIT} />
  }

  if (!isValidBooking) {
    return (
      <Layout>
        <Container>
          <Box className="notification-container">
            <Box className="notification-card">
              <ErrorIcon className="notification-icon" style={{ color: '#d32f2f' }} />
              <Typography variant="h5" className="notification-title">
                {commonStrings.NOT_AUTHORIZED}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                className="review-notification-button"
                onClick={handleGoHome}
              >
                {commonStrings.GO_BACK_HOME}
              </Button>
            </Box>
          </Box>
        </Container>
      </Layout>
    )
  }

  if (submitted) {
    return (
      <Layout>
        <Container>
          <Box className="notification-container">
            <Box className="notification-card">
              <CheckCircleIcon className="notification-icon" style={{ color: '#2e7d32' }} />
              <Typography variant="h5" className="notification-title">
                {commonStrings.THANK_YOU}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                className="review-notification-button"
                onClick={handleGoHome}
              >
                {commonStrings.GO_BACK_HOME}
              </Button>
            </Box>
          </Box>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            {/* Colonne de gauche : Informations de l'utilisateur */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <section className="user-avatar-sec">
                  <Avatar
                    record={user}
                    type={user?.type || ''}
                    mode="update"
                    size="large"
                    hideDelete
                    color="disabled"
                    className="user-avatar"
                    readonly
                    verified
                  />
                </section>
                <Typography variant="h4" className="user-name">
                  {user?.fullName}
                </Typography>
                {user?.bio && (
                  <Typography variant="h6" className="user-info">
                    {user.bio}
                  </Typography>
                )}
                {user?.location && (
                  <Typography variant="h6" className="user-info">
                    {user.location}
                  </Typography>
                )}
                {user?.phone && (
                  <Typography variant="h6" className="user-info">
                    {user.phone}
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Colonne de droite : Formulaire de review */}
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  {commonStrings.EVALUATE_DRIVER}
                </Typography>

                <form onSubmit={handleSubmit}>
                  <FormControl fullWidth margin="normal" error={errors.rating}>
                    <Typography component="legend">{commonStrings.RATING}</Typography>
                    <Rating
                      size="large"
                      name="rating"
                      precision={0.5}
                      value={rating}
                      onChange={(_, newValue) => setRating(newValue)}
                    />
                    {errors.rating && (
                      <Typography color="error" variant="caption">
                        {commonStrings.RATING_REQUIRED}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <TextField
                      label={commonStrings.COMMENTS}
                      multiline
                      rows={4}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      required={rating !== null && rating < 3}
                      error={errors.comments}
                      helperText={errors.comments ? commonStrings.COMMENTS_REQUIRED : ''}
                    />
                  </FormControl>

                  <FormControl fullWidth margin="normal" error={errors.answeredCall}>
                    <Typography component="legend">{commonStrings.ANSWERED_CALL_QUESTION}</Typography>
                    <RadioGroup
                      value={answeredCall}
                      onChange={(e) => setAnsweredCall(e.target.value)}
                    >
                      <FormControlLabel value="Oui" control={<Radio />} label="Oui" />
                      <FormControlLabel value="Non" control={<Radio />} label="Non" />
                    </RadioGroup>
                    {errors.answeredCall && (
                      <Typography color="error" variant="caption">
                        {commonStrings.ANSWER_ALL_QUESTIONS}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl fullWidth margin="normal" error={errors.canceledLastMinute}>
                    <Typography component="legend">{commonStrings.CANCELED_LAST_MINUTE_QUESTION}</Typography>
                    <RadioGroup
                      value={canceledLastMinute}
                      onChange={(e) => setCanceledLastMinute(e.target.value)}
                    >
                      <FormControlLabel value="Oui" control={<Radio />} label="Oui" />
                      <FormControlLabel value="Non" control={<Radio />} label="Non" />
                    </RadioGroup>
                    {errors.canceledLastMinute && (
                      <Typography color="error" variant="caption">
                        {commonStrings.ANSWER_ALL_QUESTIONS}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl fullWidth margin="normal" error={errors.rentedCar}>
                    <Typography component="legend">{commonStrings.RENTED_CAR_QUESTION}</Typography>
                    <RadioGroup
                      value={rentedCar}
                      onChange={(e) => setRentedCar(e.target.value)}
                    >
                      <FormControlLabel value="Oui" control={<Radio />} label="Oui" />
                      <FormControlLabel value="Non" control={<Radio />} label="Non" />
                    </RadioGroup>
                    {errors.rentedCar && (
                      <Typography color="error" variant="caption">
                        {commonStrings.ANSWER_ALL_QUESTIONS}
                      </Typography>
                    )}
                  </FormControl>

                  <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                      {isSubmitting ? <CircularProgress size={24} /> : commonStrings.SUBMIT_REVIEW}
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Notification toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={() => setToastOpen(false)}
      >
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Layout>
  )
}

export default DriverReviewPage
