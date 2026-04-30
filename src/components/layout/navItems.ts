import type { LucideIcon } from 'lucide-react'
import {
  ClipboardCheck,
  FilePenLine,
  Grid2X2,
  History,
  Home,
  PenLine,
  Settings,
} from 'lucide-react'

export type PageKey =
  | 'dashboard'
  | 'idea'
  | 'argument'
  | 'material'
  | 'diagnosis'
  | 'history'
  | 'settings'

export type NavItem = {
  key: PageKey
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: '首页', icon: Home },
  { key: 'idea', label: '审题立意', icon: ClipboardCheck },
  { key: 'argument', label: '论点生成', icon: FilePenLine },
  { key: 'material', label: '素材推荐', icon: Grid2X2 },
  { key: 'diagnosis', label: '作文诊断', icon: PenLine },
  { key: 'history', label: '历史记录', icon: History },
  { key: 'settings', label: '设置', icon: Settings },
]
