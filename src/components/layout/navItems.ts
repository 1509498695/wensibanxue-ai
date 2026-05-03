import type { LucideIcon } from 'lucide-react'
import {
  ClipboardCheck,
  FileBadge,
  FilePenLine,
  Grid2X2,
  History,
  Home,
  ListChecks,
  PenLine,
  Settings,
  Star,
} from 'lucide-react'

export type PageKey =
  | 'dashboard'
  | 'about'
  | 'workflow'
  | 'idea'
  | 'argument'
  | 'material'
  | 'diagnosis'
  | 'favorites'
  | 'history'
  | 'settings'

export type NavItem = {
  key: PageKey
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: '首页', icon: Home },
  { key: 'about', label: '作品介绍', icon: FileBadge },
  { key: 'workflow', label: '五步写作', icon: ListChecks },
  { key: 'idea', label: '审题立意', icon: ClipboardCheck },
  { key: 'argument', label: '论点生成', icon: FilePenLine },
  { key: 'material', label: '素材推荐', icon: Grid2X2 },
  { key: 'diagnosis', label: '作文诊断', icon: PenLine },
  { key: 'favorites', label: '收藏夹', icon: Star },
  { key: 'history', label: '历史记录', icon: History },
  { key: 'settings', label: '设置', icon: Settings },
]
