export default function ChatListItem({ chat, conversation, isSelected, isActive, onClick }) {
  const formatTime = (date) => {
    const time = new Date(date)
    const now = new Date()
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 1440) return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Support both tenant conversation format and landlord chat format
  const data = chat || conversation
  const name = data?.tenantName || data?.name
  const role = data?.role
  const avatar = data?.tenantAvatar || data?.avatar
  const lastMessage = data?.lastMessage
  const timestamp = data?.timestamp || data?.lastMessageTime
  const unread = data?.unread || (!data?.isRead ? 1 : 0)
  const isSelected_ = isSelected || isActive

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 flex gap-3 hover:bg-foreground dark:hover:bg-dark-foreground transition-colors border-b border-border dark:border-dark-border text-left ${
        isSelected_ ? 'bg-foreground dark:bg-dark-foreground' : ''
      }`}
    >
      {/* Avatar */}
      <img
        src={avatar || 'https://via.placeholder.com/40x40?text=User'}
        alt={name}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="font-semibold text-dark dark:text-light truncate">{name}</h4>
            {role && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:bg-primary/20 flex-shrink-0">
                {role}
              </span>
            )}
          </div>
          <span className="text-xs text-muted dark:text-dark-muted flex-shrink-0">{formatTime(timestamp)}</span>
        </div>
        <p className={`text-sm truncate ${
          unread > 0 ? 'font-medium text-dark dark:text-light' : 'text-muted dark:text-dark-muted'
        }`}>
          {lastMessage}
        </p>
      </div>

      {/* Unread indicator */}
      {unread > 0 && (
        <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1"></div>
      )}
    </button>
  )
}
