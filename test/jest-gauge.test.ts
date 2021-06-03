import { jest, test, expect, describe, beforeEach } from '@jest/globals'
import { process, getCacheKey } from '../src/index'

test('has a method called `process`', () => {
    expect(process).toBeDefined();
})

test('has a method called `getCacheKey`', () => {
    expect(getCacheKey).toBeDefined();
})