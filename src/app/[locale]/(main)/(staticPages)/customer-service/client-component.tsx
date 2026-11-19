'use client'
import { useState, useRef } from 'react'
import {
    MdOutlineKeyboardArrowDown,
    MdOutlineLocalShipping,
    MdOutlineAssignmentReturn,
    MdOutlineHelpOutline,
    MdOutlineMailOutline,
    MdCheck,
} from "react-icons/md";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@medusajs/ui"
import { Banner } from '@modules/common/components/swh/utilities';
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"
import { contactSupport } from "@lib/data/contact-support"

type FaqItem = {
    question: string
    answer: string
}

type FaqSection = {
    eyebrow: string
    heading: string
    items: FaqItem[]
}

// Sections are ordered delivery → returns in every locale
const sectionIcons = [MdOutlineLocalShipping, MdOutlineAssignmentReturn]

const inputClass = 'h-12 w-full rounded-lg border border-line bg-white px-4 text-base text-black placeholder:text-secondary2 transition-colors focus:border-black focus:outline-none'
const labelClass = 'mb-1.5 block text-sm font-medium text-black'

// Turns the email address inside the form description into a mailto link
const withMailLink = (text: string) =>
    text.split(/(\S+@\S+\.\w+)/).map((part, i) =>
        i % 2 === 1
            ? <a key={i} href={`mailto:${part}`} className="font-medium text-black underline underline-offset-2 hover:text-[#ef7a4c]">{part}</a>
            : part
    )

const answerLinkClass = 'font-medium text-black underline underline-offset-2 hover:text-[#ef7a4c]'

// FAQ answers carry [text](href) links: store paths go through the localized router, the rest are plain anchors
const renderAnswer = (text: string) =>
    text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (!link) return part
        const [, label, href] = link
        if (href.startsWith('/')) {
            return (
                <LocalizedClientLink key={i} href={href as React.ComponentProps<typeof LocalizedClientLink>['href']} className={answerLinkClass}>
                    {label}
                </LocalizedClientLink>
            )
        }
        const external = href.startsWith('http')
        return (
            <a key={i} href={href} className={answerLinkClass} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {label}
            </a>
        )
    })

const ContactUs = () => {
    const recaptchaRef = useRef<ReCAPTCHA>(null)
    const [activeQuestion, setActiveQuestion] = useState<string | undefined>('')
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: '',
        orderNumber: '',
        reason: '',
        email: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState(false)
    const [stepError, setStepError] = useState('')
    const t = useTranslations("StaticPages.CustomerService")
    const sections = t.raw("faqSections") as FaqSection[]
    const reasonOptions = t.raw("form.reasonOptions") as string[]

    const handleActiveQuestion = (questionId: string) => {
        setActiveQuestion(prevQuestion => prevQuestion === questionId ? undefined : questionId)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({
            ...prev,
            [id]: value
        }))
        setStepError('')
    }

    const handleNextStep = () => {
        if (!formData.orderNumber.trim()) {
            setStepError(t("form.orderNumberError") || "Order number is required")
            return
        }
        setCurrentStep(2)
    }

    const handlePreviousStep = () => {
        setCurrentStep(1)
        setStepError('')
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!formData.email.trim()) {
            setStepError(t("form.emailError") || "Email is required")
            return
        }

        if (!formData.message.trim()) {
            setStepError(t("form.messageError") || "Message is required")
            return
        }

        const recaptchaToken = recaptchaRef.current?.getValue()
        if (!recaptchaToken) {
            setStepError("Please verify reCAPTCHA")
            return
        }

        setIsSubmitting(true)

        try {
            await contactSupport({
                firstName: formData.firstName,
                orderNumber: formData.orderNumber,
                reason: formData.reason,
                email: formData.email,
                message: formData.message,
                recaptchaToken
            })

            setSuccessMessage(true)
            setFormData({ firstName: '', orderNumber: '', reason: '', email: '', message: '' })
            setCurrentStep(1)
            recaptchaRef.current?.reset()

            setTimeout(() => setSuccessMessage(false), 5000)
        } catch (error) {
            setStepError(error instanceof Error ? error.message : "Failed to submit form")
            recaptchaRef.current?.reset()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="plain-theme">
            <Banner heading={t("banner.heading")} subHeading={t("banner.subHeading")} />

            <div className='contact-us w-full bg-surface'>
                <div className="mx-auto w-full max-w-[1200px] px-4 py-8 small:py-14">
                    <div className="grid grid-cols-1 items-start gap-6 small:grid-cols-[minmax(0,1fr)_440px] small:gap-8">

                        {/* FAQs */}
                        <div className="faqs-block flex min-w-0 flex-col gap-y-6">
                            {sections.map((section, sectionIndex) => {
                                const SectionIcon = sectionIcons[sectionIndex] ?? MdOutlineHelpOutline
                                return (
                                    <section
                                        key={section.heading}
                                        className="overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm"
                                    >
                                        <div className="flex items-start gap-4 px-5 py-5 small:px-7 small:py-6">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-christmasBgGray text-black">
                                                <SectionIcon className="h-5 w-5" />
                                            </span>
                                            <div className="min-w-0">
                                                <h2 className="text-lg font-semibold text-black small:text-xl">{section.heading}</h2>
                                                <p className="mt-0.5 text-sm text-secondary small:text-base">{section.eyebrow}</p>
                                            </div>
                                        </div>

                                        <div className="tab-question divide-y divide-line border-t border-line">
                                            {section.items.map((item, itemIndex) => {
                                                const questionId = `${sectionIndex}-${itemIndex}`
                                                const isOpen = activeQuestion === questionId
                                                return (
                                                    <div className={`question-item ${isOpen ? 'open bg-christmasBg' : ''} transition-colors duration-300`} key={questionId}>
                                                        <button
                                                            type="button"
                                                            className="heading flex w-full items-center justify-between gap-4 px-5 py-4 text-left small:px-7"
                                                            onClick={() => handleActiveQuestion(questionId)}
                                                            aria-expanded={isOpen}
                                                            aria-controls={`faq-${questionId}`}
                                                        >
                                                            <span className={`text-[15px] small:text-base ${isOpen ? 'font-medium text-black' : 'text-christmasText'}`}>{item.question}</span>
                                                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'rotate-180 border-black bg-black text-white' : 'border-line text-black'}`}>
                                                                <MdOutlineKeyboardArrowDown className="h-5 w-5" />
                                                            </span>
                                                        </button>
                                                        <div
                                                            id={`faq-${questionId}`}
                                                            role="region"
                                                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                                                        >
                                                            <div className="overflow-hidden">
                                                                <div className="content christmas-font whitespace-pre-line break-words px-5 pb-5 text-[15px] small:px-7 small:text-base">
                                                                    {renderAnswer(item.answer)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )
                            })}
                        </div>

                        {/* Contact form */}
                        <div className="small:sticky small:top-24">
                            <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm">
                                <div className="flex items-start gap-4 px-5 py-5 small:px-7 small:py-6">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white">
                                        <MdOutlineMailOutline className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-semibold text-black small:text-xl">{t("form.heading")}</h2>
                                        <p className="mt-0.5 break-words text-sm text-secondary">{withMailLink(t("form.description"))}</p>
                                    </div>
                                </div>

                                {successMessage ? (
                                    <div className="flex flex-col items-center gap-y-4 border-t border-line px-5 py-12 text-center small:px-7" role="status">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                                            <MdCheck className="h-7 w-7" />
                                        </span>
                                        <p className="max-w-[300px] text-base font-medium text-black">
                                            {t("form.success") || "Thank you! Your message has been sent successfully."}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Step Indicator */}
                                        <div className="border-t border-line bg-ui-bg-subtle px-5 py-4 small:px-7">
                                            <div className="flex items-center gap-3">
                                                {[1, 2].map((step) => (
                                                    <div key={step} className={`flex items-center gap-3 ${step === 1 ? 'flex-1' : ''}`}>
                                                        <span
                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors duration-300 ${currentStep >= step ? 'bg-black text-white' : 'border border-line bg-white text-secondary'}`}
                                                            aria-current={currentStep === step ? 'step' : undefined}
                                                        >
                                                            {currentStep > step ? <MdCheck className="h-4 w-4" /> : step}
                                                        </span>
                                                        {step === 1 && (
                                                            <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                                                                <div className={`h-full bg-black transition-all duration-500 ${currentStep >= 2 ? 'w-full' : 'w-0'}`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-2 text-xs text-secondary small:text-sm">
                                                {t("form.step") || "Step"} {currentStep} {t("form.of") || "of"} 2
                                            </p>
                                        </div>

                                        <form
                                            className="border-t border-line px-5 py-5 small:px-7 small:py-6"
                                            onSubmit={currentStep === 2 ? handleFormSubmit : (e) => { e.preventDefault(); handleNextStep(); }}
                                        >
                                            {stepError && (
                                                <div className="mb-5 rounded-lg border border-red/40 bg-red/10 px-4 py-3" role="alert">
                                                    <div className="text-sm text-red">{stepError}</div>
                                                </div>
                                            )}

                                            {/* Step 1: Order Details */}
                                            {currentStep === 1 && (
                                                <div className='grid grid-cols-1 gap-y-5'>
                                                    <div className="name">
                                                        <label className={labelClass} htmlFor="firstName">{t("form.firstNameLabel")}</label>
                                                        <input
                                                            className={inputClass}
                                                            id="firstName"
                                                            type="text"
                                                            placeholder={t("form.firstNamePlaceholder")}
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="order-number">
                                                        <label className={labelClass} htmlFor="orderNumber">{t("form.orderNumberLabel")} <span className='text-red'>*</span></label>
                                                        <input
                                                            className={inputClass}
                                                            id="orderNumber"
                                                            type="number"
                                                            placeholder={t("form.orderNumberPlaceholder")}
                                                            value={formData.orderNumber}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="select-reason">
                                                        <label className={labelClass} htmlFor="reason">{t("form.reasonLabel")}</label>
                                                        <div className="relative">
                                                            <select
                                                                id="reason"
                                                                className={`${inputClass} cursor-pointer appearance-none pr-10 ${formData.reason ? '' : 'text-secondary2'}`}
                                                                value={formData.reason}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="">Select a reason</option>
                                                                {reasonOptions.map((option) => (
                                                                    <option className="text-black" value={option} key={option}>{option}</option>
                                                                ))}
                                                            </select>
                                                            <MdOutlineKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Message Details */}
                                            {currentStep === 2 && (
                                                <div className='grid grid-cols-1 gap-y-5'>
                                                    <div className="email">
                                                        <label className={labelClass} htmlFor="email">{t("form.emailLabel") || "Email"} <span className='text-red'>*</span></label>
                                                        <input
                                                            className={inputClass}
                                                            id="email"
                                                            type="email"
                                                            placeholder={t("form.emailPlaceholder") || "your@email.com"}
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="message">
                                                        <label className={labelClass} htmlFor="message">{t("form.messageLabel") || "Message"} <span className='text-red'>*</span></label>
                                                        <textarea
                                                            className={`${inputClass} h-auto min-h-[150px] resize-none py-3`}
                                                            id="message"
                                                            placeholder={t("form.messagePlaceholder") || "Tell us more about your request..."}
                                                            value={formData.message}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    {/* reCAPTCHA is a fixed 304px iframe; shrink it on very narrow phones */}
                                                    <div className="origin-left max-[380px]:scale-[0.88]">
                                                        <ReCAPTCHA
                                                            ref={recaptchaRef}
                                                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Buttons */}
                                            <div className="mt-6 flex flex-col-reverse gap-3 xsmall:flex-row">
                                                {currentStep === 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="large"
                                                        onClick={handlePreviousStep}
                                                        className="h-12 flex-1"
                                                    >
                                                        {t("form.back") || "Back"}
                                                    </Button>
                                                )}
                                                <Button
                                                    type="submit"
                                                    size="large"
                                                    className="h-12 flex-1"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting
                                                        ? (t("form.submitting") || "Submitting...")
                                                        : currentStep === 1
                                                        ? (t("form.next") || "Next")
                                                        : t("form.submit")}
                                                </Button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactUs
