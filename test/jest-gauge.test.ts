import { jest, test, expect, describe, beforeEach } from '@jest/globals'
import { process } from '../src/index'

test('has at least a method called `process`', () => {
    expect(process).toBeDefined();
})