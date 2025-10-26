import type { PreviousCorrectedCallback } from '../types/ObservationConfig';
/**
 * If cov is a number, result will be Identity*cov
 * If cov is an Number[], result will be diag(cov)
 * If cov is an Number[][], result will be cov
 */
export default function polymorphMatrix(cov: number | number[] | number[][] | PreviousCorrectedCallback, opts?: {
    dimension?: number;
    title?: string;
}): number[][] | PreviousCorrectedCallback | undefined;
//# sourceMappingURL=polymorph-matrix.d.ts.map