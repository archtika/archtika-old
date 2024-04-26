import { writable } from 'svelte/store'
import type { Component } from './types'

export const components = writable<Component[]>([])

export const currentComponentSpan = writable<{
    rowEnd: number
    colEnd: number
}>({
    rowEnd: 0,
    colEnd: 0
})
