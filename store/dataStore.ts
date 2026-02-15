import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DataDNA {
    // Dataset metadata
    filename: string;
    rowCount: number;
    columnCount: number;
    uploadDate: Date;

    // Data Health
    health?: {
        score: number;
        grade: string;
        completeness: number;
        duplicateRows: number;
        duplicatePct: number;
        missingCells: number;
        constantCols: string[];
        allNullCols: string[];
        highMissingCols: string[];
        missingByCol: Record<string, number>;
    };

    // Missing Data Summary
    missingSummary?: {
        hasMissing: boolean;
        affectedColumns: number;
        affectedRows: number;
        affectedRowsPct: number;
        fullyEmptyRows: number;
        coMissingPairs: { colA: string; colB: string; coMissingCount: number }[];
    };

    // Schema information
    columns: {
        name: string;
        type: 'numeric' | 'categorical' | 'datetime' | 'text' | 'boolean' | 'categorical_numeric';
        dtype?: string;
        nullPercentage: number;
        uniqueCount?: number;
        outlierCount?: number;
        sampleValues: string[];
        // Numeric specific
        mean?: number;
        median?: number;
        std?: number;
        min?: number;
        max?: number;
        iqr?: number;
        skewness?: number;
        kurtosis?: number;
        zerosPct?: number;
        outlierPct?: number;
        outlierCountIqr?: number;
        topValues?: string[];
        topValuePct?: number;
        entropy?: number;
        isDominated?: boolean;
        rareValues?: number;
        // Date specific
        minDate?: string;
        maxDate?: string;
        spanDays?: number;
        peakHour?: number;
        peakDay?: string;
        medianGapDays?: number;
    }[];

    // Outliers
    outlierSummary?: {
        column: string;
        iqrOutliers: number;
        iqrOutlierPct: number;
        extremeOutliers: number;
        lowerFence: number;
        upperFence: number;
        minOutlier?: number;
        maxOutlier?: number;
    }[];

    // Correlations
    correlations?: {
        colA: string;
        colB: string;
        strength: string;
        pearsonR: number;
        spearmanR?: number;
        direction?: string;
        nonlinear?: boolean;
    }[];

    // Segment Breakdown
    segmentBreakdown?: {
        dimension: string;
        metric: string;
        data: any[];
    }[];

    // Datetime Info
    datetimeInfo?: {
        column: string;
        peakHour: number;
        peakDay: string;
        peakMonth: number;
        spanDays: number;
        businessHoursPct: number;
        hourDistribution: Record<string, number>;
        dayDistribution: Record<string, number>;
    };

    // Baselines
    baselines: {
        [key: string]: any;
    };

    // Detected patterns
    patterns: string[];

    // Pre-loaded insights
    insights: string[];

    // Accumulated insights
    accumulatedInsights?: string[];
}

interface DataState {
    // Active dataset
    activeDatasetId: string | null;
    dataDNA: DataDNA | null;

    // Actions
    setDataDNA: (dna: DataDNA) => void;
    clearDataDNA: () => void;
    updateBaselines: (baselines: Partial<DataDNA['baselines']>) => void;
    addPattern: (pattern: string) => void;
    addInsight: (insight: string) => void;
}

export const useDataStore = create<DataState>()(
    persist(
        (set) => ({
            activeDatasetId: null,
            dataDNA: null,

            setDataDNA: (dna) => {
                set({
                    dataDNA: dna,
                    activeDatasetId: `dataset_${Date.now()}`,
                });
            },

            clearDataDNA: () => {
                set({
                    dataDNA: null,
                    activeDatasetId: null,
                });
            },

            updateBaselines: (baselines) => {
                set((state) => ({
                    dataDNA: state.dataDNA
                        ? {
                            ...state.dataDNA,
                            baselines: { ...state.dataDNA.baselines, ...baselines },
                        }
                        : null,
                }));
            },

            addPattern: (pattern) => {
                set((state) => ({
                    dataDNA: state.dataDNA
                        ? {
                            ...state.dataDNA,
                            patterns: [...state.dataDNA.patterns, pattern],
                        }
                        : null,
                }));
            },

            addInsight: (insight) => {
                set((state) => ({
                    dataDNA: state.dataDNA
                        ? {
                            ...state.dataDNA,
                            insights: [...state.dataDNA.insights, insight],
                        }
                        : null,
                }));
            },
        }),
        {
            name: 'insightx-data-storage',
        }
    )
);
