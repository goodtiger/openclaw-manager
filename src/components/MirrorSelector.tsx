import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MirrorOption {
  id: string;
  label: string;
  url: string | null;
}

export const DEFAULT_MIRRORS: MirrorOption[] = [
  { id: 'official', label: 'npm 官方', url: null },
  { id: 'npmmirror', label: 'npmmirror (淘宝)', url: 'https://registry.npmmirror.com' },
];

interface MirrorSelectorProps {
  /** 当前选中的镜像 ID */
  value: string;
  /** 切换镜像的回调 */
  onChange: (id: string) => void;
  /** 紧凑模式（适合嵌入到卡片中） */
  compact?: boolean;
}

/**
 * npm 镜像选择器
 * 返回选中的镜像的 url（null 表示使用官方源）
 */
export function MirrorSelector({ value, onChange, compact = false }: MirrorSelectorProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const selected = DEFAULT_MIRRORS.find((m) => m.id === value) ?? DEFAULT_MIRRORS[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-content-secondary hover:text-content-primary transition-colors"
        >
          <Globe size={12} />
          <span>{selected.label}</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute bottom-full left-0 mb-1 bg-surface-card border border-edge rounded-lg shadow-lg overflow-hidden z-10 min-w-[160px]"
            >
              {DEFAULT_MIRRORS.map((mirror) => (
                <button
                  key={mirror.id}
                  onClick={() => {
                    onChange(mirror.id);
                    setExpanded(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-surface-elevated transition-colors ${
                    mirror.id === value
                      ? 'text-claw-500 font-medium'
                      : 'text-content-secondary'
                  }`}
                >
                  {mirror.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Globe size={14} className="text-content-tertiary" />
      <span className="text-xs text-content-tertiary">{t('setup.mirrorSource')}：</span>
      <div className="flex gap-1">
        {DEFAULT_MIRRORS.map((mirror) => (
          <button
            key={mirror.id}
            onClick={() => onChange(mirror.id)}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              mirror.id === value
                ? 'bg-claw-500/20 text-claw-500 font-medium border border-claw-500/30'
                : 'bg-surface-elevated text-content-secondary border border-edge hover:text-content-primary'
            }`}
          >
            {mirror.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 根据镜像 ID 获取 URL */
export function getMirrorUrl(mirrorId: string): string | null {
  return DEFAULT_MIRRORS.find((m) => m.id === mirrorId)?.url ?? null;
}
