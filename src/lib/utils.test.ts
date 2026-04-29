import { describe, it, expect } from 'vitest';
import { formatDate } from '$lib/utils';

describe('formatDate', () => {
	it('formats a valid ISO date string', () => {
		const result = formatDate('2024-01-15T10:00:00Z');
		expect(result).toBe('Jan 15, 2024');
	});

	it('returns "—" for null', () => {
		expect(formatDate(null)).toBe('—');
	});

	it('returns "—" for undefined', () => {
		expect(formatDate(undefined)).toBe('—');
	});

	it('returns "—" for empty string', () => {
		expect(formatDate('')).toBe('—');
	});

	it('returns "—" for invalid date string', () => {
		expect(formatDate('not-a-date')).toBe('—');
	});

	it('formats a Date object', () => {
		const result = formatDate(new Date('2024-06-01T00:00:00Z'));
		expect(result).toBeTruthy();
		expect(result).not.toBe('—');
	});
});