'use client'

import { Plus, Download, Upload, RefreshCw } from 'lucide-react'

interface QuickActionsProps {
  onAddItem: () => void
  onRefresh: () => void
  onExport?: () => void
  onImport?: () => void
}

export default function QuickActions({ 
  onAddItem, 
  onRefresh, 
  onExport, 
  onImport 
}: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onAddItem}
        className="btn btn-primary flex items-center"
      >
        <Plus size={20} className="mr-2" />
        Add New Item
      </button>

      <button
        onClick={onRefresh}
        className="btn btn-secondary flex items-center"
      >
        <RefreshCw size={20} className="mr-2" />
        Refresh
      </button>

      {onExport && (
        <button
          onClick={onExport}
          className="btn btn-secondary flex items-center"
        >
          <Download size={20} className="mr-2" />
          Export
        </button>
      )}

      {onImport && (
        <button
          onClick={onImport}
          className="btn btn-secondary flex items-center"
        >
          <Upload size={20} className="mr-2" />
          Import
        </button>
      )}
    </div>
  )
}
