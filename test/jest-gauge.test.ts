import { jest, test, expect, describe, beforeEach } from '@jest/globals'
import transformer from '../src/index'

test('has at least a method called `process`', () => {
    expect(transformer.process).toBeDefined();
})