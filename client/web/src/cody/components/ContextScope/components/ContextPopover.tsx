import React, { useState, useEffect } from 'react'

import {
    mdiChevronUp,
    mdiCloseCircleOutline,
    mdiClose,
    mdiPlusCircleOutline,
    mdiMinusCircleOutline,
    mdiGithub,
    mdiCloseCircle,
    mdiCheckOutline,
    mdiDatabaseCheck,
    mdiDatabaseCheckOutline,
    mdiDatabaseSyncOutline,
    mdiDatabaseRemoveOutline,
    mdiCheck,
} from '@mdi/js'
import classNames from 'classnames'

import {
    Icon,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Position,
    Button,
    Card,
    Text,
    Input,
} from '@sourcegraph/wildcard'

import { TruncatedText } from '../../../../enterprise/insights/components'
import { ContextType, SELECTED } from '../ContextScope'

import { repoMockedModel, filesMockedModel } from './mockedModels'

import styles from './ContextComponents.module.scss'

export const ContextPopover: React.FC<{
    header: string
    icon: string
    emptyMessage: string
    inputPlaceholder: string
    items?: string[]
    contextType: ContextType
    itemType: string
}> = ({ header, icon, emptyMessage, inputPlaceholder, items, contextType, itemType }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [currentItems, setCurrentItems] = useState<string[] | undefined>(items)
    const [searchText, setSearchText] = useState('')

    useEffect(() => {
        setCurrentItems(items)
        clearSearchText()
    }, [items])

    const clearSearchText = () => {
        setSearchText('')
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const handleClearAll = () => {
        setCurrentItems([])
    }

    const handleAddAll = () => {
        if (filteredItems && filteredItems.length > 0) {
            setCurrentItems(prevItems => (prevItems ? [...prevItems, ...filteredItems] : filteredItems))
            clearSearchText() // Clear the search text after adding all items
        }
    }

    const handleRemoveItem = (index: number) => {
        setCurrentItems(prevItems => {
            if (prevItems) {
                const updatedItems = [...prevItems]
                updatedItems.splice(index, 1)
                return updatedItems
            }
            return prevItems
        })
    }

    const handleAddItem = (index: number) => {
        if (filteredItems) {
            const selectedItem = filteredItems[index]
            setCurrentItems(prevItems => {
                if (prevItems) {
                    // Check if the item is already in the currentItems list
                    const itemIndex = prevItems.indexOf(selectedItem)
                    if (itemIndex !== -1) {
                        // Item exists, remove it from the list
                        const updatedItems = [...prevItems]
                        updatedItems.splice(itemIndex, 1)
                        return updatedItems
                    } else {
                        // Item doesn't exist, add it to the list
                        return [...prevItems, selectedItem]
                    }
                }
                // prevItems is undefined, return a new list with the selected item
                return [selectedItem]
            })
        }
    }

    const filteredItems =
        contextType === SELECTED.REPOSITORIES
            ? repoMockedModel.filter(item => fuzzySearch(item, searchText))
            : filesMockedModel.filter(item => !currentItems?.includes(item) && fuzzySearch(item, searchText))

    const isSearching = searchText.length > 0
    const isSearchEmpty = isSearching && filteredItems.length === 0
    const isEmpty = !currentItems || currentItems.length === 0

    return (
        <Popover isOpen={isPopoverOpen} onOpenChange={event => setIsPopoverOpen(event.isOpen)}>
            <PopoverTrigger
                as={Button}
                outline={false}
                className={classNames(
                    'd-flex justify-content-between p-0 align-items-center w-100',
                    styles.triggerButton
                )}
            >
                <div className={classNames(isEmpty && styles.triggerButtonEmpty, styles.triggerButtonInner)}>
                    <Icon aria-hidden={true} svgPath={mdiChevronUp} />{' '}
                    {isEmpty ? (
                        `${header}...`
                    ) : (
                        <TruncatedText>
                            {currentItems.length} {itemType} ({currentItems?.map(item => getFileName(item)).join(', ')})
                        </TruncatedText>
                    )}
                </div>
            </PopoverTrigger>

            <PopoverContent position={Position.topStart}>
                <Card className={styles.card}>
                    <div className={classNames('justify-content-between', styles.header)}>CHAT CONTEXT</div>
                    {(isEmpty && !isSearching) || isSearchEmpty ? (
                        <EmptyState
                            icon={icon}
                            message={isSearchEmpty ? `No ${itemType} found for '${searchText}'` : emptyMessage}
                        />
                    ) : (
                        <>
                            <div className={styles.itemsContainer}>
                                {(isSearching ? filteredItems : currentItems)?.map((item, index) => (
                                    <ContextItem
                                        item={item}
                                        icon={icon}
                                        searchText={searchText}
                                        contextType={contextType}
                                        handleAddItem={() => handleAddItem(index)}
                                        handleRemoveItem={() => handleRemoveItem(index)}
                                        isSelected={currentItems?.includes(item) || false}
                                    />
                                ))}
                            </div>

                            {/* <ContextActions
                                isSearching={isSearching}
                                handleAddAll={handleAddAll}
                                handleClearAll={handleClearAll}
                            /> */}
                        </>
                    )}

                    <div className={styles.footer}>
                        <Input
                            role="combobox"
                            autoFocus={true}
                            autoComplete="off"
                            spellCheck="false"
                            placeholder={inputPlaceholder}
                            variant="small"
                            value={searchText}
                            onChange={handleSearch}
                        />
                        {isSearching && (
                            <Button
                                className={classNames(
                                    'd-flex p-1 align-items-center justify-content-center',
                                    styles.clearButton
                                )}
                                variant="icon"
                                onClick={clearSearchText}
                                aria-label="Clear"
                            >
                                <Icon aria-hidden={true} svgPath={mdiCloseCircle} />
                            </Button>
                        )}
                    </div>
                </Card>
            </PopoverContent>
        </Popover>
    )
}

const ContextItem: React.FC<{
    item: string
    icon: string
    searchText: string
    contextType: ContextType
    handleAddItem: () => void
    handleRemoveItem: () => void
    isSelected: boolean
}> = ({ item, icon, searchText, contextType, handleAddItem, handleRemoveItem, isSelected }) => {
    const getRandomIcon = () => {
        const icons = [mdiDatabaseCheckOutline, mdiDatabaseSyncOutline, mdiDatabaseRemoveOutline]
        return icons[Math.floor(Math.random() * icons.length)]
    }

    const randomIcon = getRandomIcon()

    return (
        <div className={classNames('d-flex justify-content-between flex-row p-1 rounded-lg', styles.item)}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <ItemAction
                    isSearching={searchText.length > 0}
                    handleAddItem={handleAddItem}
                    handleRemoveItem={handleRemoveItem}
                    isSelected={isSelected}
                />
                <Icon aria-hidden={true} svgPath={icon} />{' '}
                <span
                    dangerouslySetInnerHTML={{
                        __html: getTintedText(contextType === SELECTED.FILES ? getFileName(item) : item, searchText),
                    }}
                />
            </div>
            <div className={classNames('d-flex align-items-center', styles.itemRight)}>
                {contextType === SELECTED.FILES && (
                    <>
                        <Icon aria-hidden={true} svgPath={mdiGithub} />{' '}
                        <Text size="small" className="m-0">
                            <span dangerouslySetInnerHTML={{ __html: getTintedText(getPath(item), searchText) }} />
                        </Text>
                    </>
                )}
                <Icon
                    style={{ color: randomIcon === mdiDatabaseRemoveOutline ? '#E09200' : 'inherit' }}
                    aria-hidden={true}
                    svgPath={randomIcon}
                />
            </div>
        </div>
    )
}

const ItemAction: React.FC<{
    isSearching: boolean
    handleAddItem: () => void
    handleRemoveItem: () => void
    isSelected: boolean
}> = ({ isSearching, handleAddItem, handleRemoveItem, isSelected }) => (
    <Button className="pl-1" variant="icon" onClick={isSearching ? handleAddItem : handleRemoveItem}>
        <Icon
            aria-hidden={true}
            svgPath={isSearching ? mdiCheck : mdiMinusCircleOutline}
            style={!isSelected ? { color: 'transparent' } : {}}
        />
    </Button>
)

const ContextActions: React.FC<{
    isSearching: boolean
    handleAddAll: () => void
    handleClearAll: () => void
}> = ({ isSearching, handleAddAll, handleClearAll }) => {
    const buttonLabel = isSearching ? 'Add all to the scope.' : 'Clear all from the scope.'
    const buttonIcon = isSearching ? mdiPlusCircleOutline : mdiCloseCircleOutline

    return (
        <Button
            className={classNames('d-flex justify-content-between', styles.itemClear)}
            variant="icon"
            onClick={isSearching ? handleAddAll : handleClearAll}
        >
            {buttonLabel}
            <Icon aria-hidden={true} svgPath={buttonIcon} />
        </Button>
    )
}

/**
 * Displays an empty state icon and message.
 */
const EmptyState: React.FC<{ icon: string; message: string }> = ({ icon, message }) => (
    <div className={classNames('d-flex align-items-center justify-content-center flex-column', styles.emptyState)}>
        <Text size="small" className="m-0 d-flex text-center">
            {message}
        </Text>
    </div>
)

/**
 * Helper fuctions for search and filtering.
 */
export const fuzzySearch = (item: string, search: string): boolean => {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const searchRegex = new RegExp(escapedSearch, 'gi')
    return searchRegex.test(item)
}

export const getTintedText = (item: string, searchText: string) => {
    const searchRegex = new RegExp(`(${searchText})`, 'gi')
    return item.replace(searchRegex, match => `<span class="${styles.tintedSearch}">${match}</span>`)
}
export const getFileName = (path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 1]
}

export const getPath = (path: string) => {
    const parts = path.split('/')
    return parts.slice(0, parts.length - 1).join('/')
}
