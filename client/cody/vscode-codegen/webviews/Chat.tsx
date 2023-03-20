import React, { useCallback, useEffect, useRef, useState } from 'react'

import { VSCodeButton, VSCodeTextArea } from '@vscode/webview-ui-toolkit/react'

import { Tips } from './Tips'
import { SubmitSvg } from './utils/icons'
import { ChatMessage } from './utils/types'
import { WebviewMessage, vscodeAPI } from './utils/VSCodeApi'

import './Chat.css'

import { getShortTimestamp } from './utils/shared'

interface ChatboxProps {
    messageInProgress: ChatMessage | null
    setMessageInProgress: (transcript: ChatMessage | null) => void
    transcript: ChatMessage[]
    setTranscript: (transcripts: ChatMessage[]) => void
    formInput: string
    setFormInput: (input: string) => void
    inputHistory: string[]
    setInputHistory: (history: string[]) => void
    onResetClick: () => void
}

export const Chat: React.FunctionComponent<React.PropsWithChildren<ChatboxProps>> = ({
    messageInProgress,
    setMessageInProgress,
    transcript,
    setTranscript,
    formInput,
    setFormInput,
    inputHistory,
    setInputHistory,
    onResetClick,
}) => {
    const [inputRows, setInputRows] = useState(5)

    const chatboxRef = useRef<HTMLInputElement>(null)
    let history = 0

    const inputHandler = useCallback(
        (inputValue: string) => {
            if (formInput === '') {
                history = 0
            }
            const rowsCount = inputValue.match(/\n/g)?.length
            if (rowsCount) {
                setInputRows(rowsCount < 5 ? 5 : rowsCount > 25 ? 25 : rowsCount)
            } else {
                setInputRows(5)
            }
            setFormInput(inputValue)
        },
        [setFormInput]
    )

    const onChatKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>): Promise<void> => {
        if (event.key === 'Enter' && !event.shiftKey && formInput) {
            event.preventDefault()
            event.stopPropagation()
            await onChatSubmit()
        }
        if (event.key === 'ArrowUp' && inputHistory.length) {
            const chatHistory = [...inputHistory].reverse().filter(input => input !== 'undefined')
            if (formInput === chatHistory[history]) {
                history += 1
            }
            if (history > chatHistory.length || !formInput) {
                history = 0
            }
            setFormInput(chatHistory[history])
        }
    }

    const onChatSubmit = useCallback(async () => {
        if (!formInput) return
        setFormInput(formInput)
        setInputHistory([...inputHistory, formInput])
        setInputRows(5)
        const chatMsg: ChatMessage = { speaker: 'human', displayText: formInput, timestamp: getShortTimestamp() }
        setMessageInProgress({ speaker: 'assistant', displayText: '', timestamp: getShortTimestamp() })
        setTranscript([...transcript, chatMsg])
        vscodeAPI.postMessage({ command: 'submit', text: formInput } as WebviewMessage)
        if (formInput === '/reset') {
            onResetClick()
        }
        history = 0
        setFormInput('')
    }, [formInput, setTranscript, setMessageInProgress, transcript, inputHistory])

    const bubbleClassName = (speaker: string): string => (speaker === 'human' ? 'human' : 'bot')

    const scrollToBottom = () => {
        chatboxRef.current?.scrollIntoView?.({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [transcript, chatboxRef])

    return (
        <div className="inner-container">
            <div className={`${transcript.length >= 1 ? '' : 'non-'}transcript-container`}>
                {/* Show Tips view if no conversation has happened */}
                {transcript.length === 0 && !messageInProgress && <Tips />}
                {transcript.length > 0 && (
                    <div className="bubble-container">
                        {transcript.map((message, index) => (
                            <div
                                key={`message-${index}`}
                                className={`bubble-row ${bubbleClassName(message.speaker)}-bubble-row`}
                            >
                                <div className={`bubble ${bubbleClassName(message.speaker)}-bubble`}>
                                    <div
                                        className={`bubble-content ${bubbleClassName(message.speaker)}-bubble-content`}
                                    >
                                        {message.speaker === 'assistant' && (
                                            <VSCodeButton
                                                className="bubble-top-icon"
                                                appearance="icon"
                                                type="button"
                                                onClick={onChatSubmit}
                                            >
                                                <i className="codicon codicon-ellipsis" />
                                            </VSCodeButton>
                                        )}
                                        {message.displayText && (
                                            <p dangerouslySetInnerHTML={{ __html: message.displayText }} />
                                        )}
                                        {message.contextFiles && message.contextFiles.length > 0 && (
                                            <ContextFiles contextFiles={message.contextFiles} />
                                        )}
                                    </div>
                                    <div className={`bubble-footer ${bubbleClassName(message.speaker)}-bubble-footer`}>
                                        <div className="bubble-footer-timestamp">{`${
                                            message.speaker === 'assistant' ? 'Cody' : 'Me'
                                        } · ${message.timestamp}`}</div>
                                        {/* Only show feedback for the last message. */}
                                        {message.speaker === 'assistant' && index === transcript.length - 1 && (
                                            <FeedbackContainer index={index} key={`feedback-${index}`} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {messageInProgress && messageInProgress.speaker === 'assistant' && (
                            <div className="bubble-row bot-bubble-row">
                                <div className="bubble bot-bubble">
                                    <div className="bubble-content bot-bubble-content">
                                        {messageInProgress.displayText ? (
                                            <p dangerouslySetInnerHTML={{ __html: messageInProgress.displayText }} />
                                        ) : (
                                            <div className="bubble-loader">
                                                <div className="bubble-loader-dot" />
                                                <div className="bubble-loader-dot" />
                                                <div className="bubble-loader-dot" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="bubble-footer bot-bubble-footer">
                                        <span>Cody is typing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatboxRef} />
                    </div>
                )}
            </div>
            <form className="input-row">
                <VSCodeTextArea
                    className="chat-input"
                    rows={inputRows}
                    name="user-query"
                    value={formInput}
                    autofocus={true}
                    disabled={!!messageInProgress}
                    required={true}
                    onInput={({ target }) => {
                        const { value } = target as HTMLInputElement
                        inputHandler(value)
                    }}
                    onKeyDown={onChatKeyDown}
                />
                <VSCodeButton className="submit-button" appearance="icon" type="button" onClick={onChatSubmit}>
                    <SubmitSvg />
                </VSCodeButton>
            </form>
        </div>
    )
}

export const ContextFiles: React.FunctionComponent<{ contextFiles: string[] }> = ({ contextFiles }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    if (contextFiles.length === 1) {
        return (
            <p>
                Cody read <code className="context-file">{contextFiles[0]}</code> file to provide an answer.
            </p>
        )
    }

    if (isExpanded) {
        return (
            <p className="context-files-expanded">
                <span className="context-files-toggle-icon" onClick={() => setIsExpanded(false)}>
                    <i className="codicon codicon-triangle-down" slot="start" />
                </span>
                <div>
                    <div className="context-files-list-title" onClick={() => setIsExpanded(false)}>
                        Cody read the following files to provide an answer:
                    </div>
                    <ul className="context-files-list-container">
                        {contextFiles.map(file => (
                            <li key={file}>
                                <code className="context-file">{file}</code>
                            </li>
                        ))}
                    </ul>
                </div>
            </p>
        )
    }

    return (
        <p className="context-files-collapsed" onClick={() => setIsExpanded(true)}>
            <span className="context-files-toggle-icon">
                <i className="codicon codicon-triangle-right" slot="start" />
            </span>
            <div className="context-files-collapsed-text">
                <p>
                    Cody read <code className="context-file">{contextFiles[0].split('/').pop()}</code> and{' '}
                    {contextFiles.length - 1} other {contextFiles.length > 2 ? 'files' : 'file'} to provide an answer.
                </p>
            </div>
        </p>
    )
}

interface FeedbackProps {
    index: number
}

export const FeedbackContainer: React.FunctionComponent<React.PropsWithChildren<FeedbackProps>> = ({ index }) => {
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

    const onFeedbackSubmit = useCallback(
        (sentiment: string) => {
            const feedback = { sentiment }
            vscodeAPI.postMessage({
                command: 'feedback',
                feedback,
            } as WebviewMessage)
            setFeedbackSubmitted(true)
        },
        [setFeedbackSubmitted, feedbackSubmitted]
    )

    return (
        <div className="feedback-container">
            {feedbackSubmitted ? (
                <div className="feedback-container-emojis">Feedback submitted</div>
            ) : (
                <div className="feedback-container-emojis">
                    <VSCodeButton
                        data-feedbacksentiment="good"
                        onClick={() => onFeedbackSubmit('good')}
                        className="feedback-button"
                    >
                        &#128077;
                    </VSCodeButton>{' '}
                    <VSCodeButton
                        data-feedbacksentiment="bad"
                        onClick={() => onFeedbackSubmit('bad')}
                        className="feedback-button"
                    >
                        &#128078;
                    </VSCodeButton>
                </div>
            )}
        </div>
    )
}
