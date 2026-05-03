import { useState } from 'react'
import { Star } from 'lucide-react'
import {
  addFavorite,
  findFavorite,
  removeFavorite,
  type AddFavoriteInput,
  type FavoriteItem,
} from '../../services/favoriteService'

type FavoriteButtonProps = {
  favorite: AddFavoriteInput
  label?: string
  onStatusChange?: (message: string, item: FavoriteItem | null) => void
}

function FavoriteButton({ favorite, label = '收藏', onStatusChange }: FavoriteButtonProps) {
  const [, refreshFavoriteState] = useState(0)
  const currentFavorite = findFavorite(favorite)
  const isFavorite = Boolean(currentFavorite)

  const handleToggle = () => {
    if (currentFavorite) {
      removeFavorite(currentFavorite.id)
      refreshFavoriteState((value) => value + 1)
      onStatusChange?.('已取消收藏', null)
      return
    }

    const nextFavorite = addFavorite(favorite)
    refreshFavoriteState((value) => value + 1)
    onStatusChange?.('已加入收藏', nextFavorite)
  }

  return (
    <button
      aria-label={isFavorite ? `取消收藏：${favorite.title}` : `收藏：${favorite.title}`}
      className={`favorite-star-button${isFavorite ? ' is-favorite' : ''}`}
      onClick={handleToggle}
      title={isFavorite ? '取消收藏' : '加入收藏'}
      type="button"
    >
      <Star fill={isFavorite ? 'currentColor' : 'none'} size={15} />
      <span>{isFavorite ? '已收藏' : label}</span>
    </button>
  )
}

export default FavoriteButton
