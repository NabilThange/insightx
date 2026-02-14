import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DataDNA {
    // Dataset metadata
    filename: string;
    rowCount: number;
    columnCount: number;
    uploadDate: Date;

    // Schema information
    columns: {
        name: string;
        type: 'numeric' | 'categorical' | 'datetime' | 'text';
        nullPercentage: number;
        sampleValues: string[];
    }[];

    // Baselines
    baselines: {
        avgValue?: number;
        successRate?: number;
        peakHours?: string;
        dateRange?: string;
        [key: string]: any;
    };

    // Detected patterns
    patterns: string[];

    // Pre-loaded insights
    insights: string[];
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
