import React, { useEffect, useMemo, useState } from 'react'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import * as MailService from '@/services/MailService'
import '@/assets/css/email-stats.css'

type Status = 'idle' | 'loading' | 'error' | 'empty' | 'ready'

const EmailStatsPage = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [status, setStatus] = useState<Status>('idle')
  const [stats, setStats] = useState<bookcarsTypes.EmailStatsResponse>()
  const [errorMessage, setErrorMessage] = useState('')

  const isAdmin = useMemo(() => user?.type === bookcarsTypes.UserType.Admin, [user?.type])

  const loadStats = async () => {
    if (!isAdmin) {
      setStatus('error')
      setErrorMessage('UNAUTHORIZED')
      return
    }

    setStatus('loading')
    try {
      const response = await MailService.getEmailStats()
      setStats(response)
      setStatus(response.history.length ? 'ready' : 'empty')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage('EMAIL_STATS_FAILED')
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
  }

  useEffect(() => {
    if (isAdmin) {
      loadStats()
    }
  }, [isAdmin])

  const renderState = () => {
    if (status === 'loading' || status === 'idle') {
      return (
        <div role="status" className="email-stats__state">
          <p>Chargement des statistiques marketing…</p>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div role="alert" className="email-stats__state email-stats__state--error">
          <p>Impossible de charger les statistiques : {errorMessage}</p>
        </div>
      )
    }

    if (status === 'empty') {
      return (
        <div role="status" className="email-stats__state">
          <p>Aucune donnée marketing pour le moment. Les rapports s’afficheront dès le premier envoi.</p>
        </div>
      )
    }

    if (!stats) {
      return null
    }

    return (
      <div className="email-stats__grid">
        <section className="email-stats__card" aria-label="Synthèse des envois">
          <h1>Campagnes marketing</h1>
          <p className="email-stats__subtitle">Suivi quotidien des e-mails Plany</p>
          <div className="email-stats__metrics" aria-live="polite">
            <div className="email-stats__metric">
              <span className="email-stats__label">Total envoyés</span>
              <strong>{stats.stats.totalSent}</strong>
            </div>
            <div className="email-stats__metric">
              <span className="email-stats__label">Ouvertures</span>
              <strong>{stats.stats.totalOpens}</strong>
            </div>
            <div className="email-stats__metric">
              <span className="email-stats__label">Clics</span>
              <strong>{stats.stats.totalClicks}</strong>
            </div>
            <div className="email-stats__metric">
              <span className="email-stats__label">Envoyés (24h)</span>
              <strong>{stats.stats.last24hSent}</strong>
            </div>
            <div className="email-stats__metric">
              <span className="email-stats__label">Limite quotidienne</span>
              <strong>{stats.stats.dailyLimit}</strong>
            </div>
          </div>
        </section>

        <section className="email-stats__card" aria-label="Historique des envois">
          <h2>Historique</h2>
          <div className="email-stats__table" role="table" aria-label="Historique des emails marketing">
            <div className="email-stats__row email-stats__row--header" role="row">
              <div role="columnheader">Date</div>
              <div role="columnheader">Envoyés</div>
              <div role="columnheader">Ouvertures</div>
              <div role="columnheader">Clics</div>
            </div>
            {stats.history.map((entry) => (
              <div className="email-stats__row" role="row" key={entry.date}>
                <div role="cell">{new Date(entry.date).toLocaleDateString()}</div>
                <div role="cell">{entry.sent}</div>
                <div role="cell">{entry.opens}</div>
                <div role="cell">{entry.clicks}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <Layout onLoad={onLoad} strict>
      <div className="email-stats" aria-live="polite">
        {renderState()}
      </div>
    </Layout>
  )
}

export default EmailStatsPage
