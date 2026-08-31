import { useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import AccountPage from './AccountPage'

export default function MessagesPage() {
  const { openInbox } = useChat()

  useEffect(() => {
    openInbox()
  }, [openInbox])

  return <AccountPage />
}
