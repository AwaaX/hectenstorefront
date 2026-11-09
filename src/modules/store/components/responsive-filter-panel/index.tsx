"use client"

import React, { Fragment } from "react"
import { Dialog, Transition, TransitionChild } from "@headlessui/react"
import * as Icon from "@phosphor-icons/react/dist/ssr"

interface ResponsiveFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  isMobile?: boolean
}

interface ResponsiveFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  isMobile?: boolean
  onClearAll?: () => void
}

/**
 * Responsive filter panel that displays as:
 * - Side panel on desktop (right slide-in)
 * - Bottom sheet on mobile (bottom slide-up)
 */
const ResponsiveFilterPanel: React.FC<ResponsiveFilterPanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  isMobile = false,
  onClearAll,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        {/* Panel Container */}
        <div
          className={`fixed ${
            isMobile
              ? "inset-x-0 bottom-0"
              : "inset-y-0 right-0 overflow-y-auto"
          }`}
        >
          <TransitionChild
            as={Fragment}
            enter={`ease-out duration-300 ${
              isMobile
                ? "transform"
                : "transform"
            }`}
            enterFrom={
              isMobile
                ? "translate-y-full"
                : "translate-x-full"
            }
            enterTo={
              isMobile
                ? "translate-y-0"
                : "translate-x-0"
            }
            leave={`ease-in duration-200 ${
              isMobile
                ? "transform"
                : "transform"
            }`}
            leaveFrom={
              isMobile
                ? "translate-y-0"
                : "translate-x-0"
            }
            leaveTo={
              isMobile
                ? "translate-y-full"
                : "translate-x-full"
            }
          >
            <Dialog.Panel
              className={`flex flex-col bg-white ${
                isMobile
                  ? "w-full max-h-[90vh] rounded-t-2xl shadow-2xl"
                  : "w-[450px] h-full shadow-xl"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-line">
                <Dialog.Title className="text-lg font-semibold">
                  {title}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Close panel"
                >
                  <Icon.X size={24} weight="bold" />
                </button>
              </div>

              {/* Content */}
              <div
                className={`flex-1 overflow-y-auto ${
                  isMobile
                    ? "px-4 py-6 sm:px-6"
                    : "px-4 py-6"
                }`}
              >
                {children}
              </div>

              {/* Footer */}
              <div className={`sticky bottom-0 border-t border-line bg-white ${
                isMobile ? "p-4 sm:p-6 space-y-2" : "p-4 sm:p-6"
              }`}>
                {onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="w-full py-2 text-sm text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Clear All
                  </button>
                )}
                {isMobile && (
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Done
                  </button>
                )}
              </div>
            </Dialog.Panel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ResponsiveFilterPanel
