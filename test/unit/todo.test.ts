import { describe, it, expect } from 'vitest'
import { isValidTitle, formatTodoInput } from '../../app/utils/index'

describe('isValidTitle', () => {

    it('should cancel an empty title', () => {
        expect(isValidTitle('')).toBe(false)
        expect(isValidTitle('  ')).toBe(false)
    })

    it('should validate the title', () => {
        expect(isValidTitle('Faire les courses')).toBe(true)
    })
})

describe('formatTodoInput', () => {
    it('should trim the title and the description', () => {

        const res = formatTodoInput(' Mon titre  ', '  Ma description      ')

        expect(res).toEqual({title: 'Mon titre', desc: 'Ma description'})

    })
})