import { DataDNA } from "@/store/dataStore";

type ScenarioType = "growth" | "fraud" | "churn" | "gateway" | "seasonal";

interface ScenarioConfig {
    type: ScenarioType;
    filenamePrefix: string;
    rowCountRange: [number, number];
    nullPercentageRange: [number, number];
    patterns: string[];
    insights: string[];
    baselines: (rowCount: number) => DataDNA["baselines"];
}

const SCENARIOS: ScenarioConfig[] = [
    {
        type: "growth",
        filenamePrefix: "growth_metrics_q4",
        rowCountRange: [150000, 500000],
        nullPercentageRange: [0, 2],
        patterns: [
            "Steady WoW Growth",
            "High User Retention",
            "Weekend Spikes",
            "Mobile Adoption"
        ],
        insights: [
            "Transaction volume up 15% WoW",
            "New user acquisition correlates with mobile usage",
            "Active users peaked at 45k last Sunday"
        ],
        baselines: (rowCount) => ({
            avgTransaction: `₹${(Math.random() * 500 + 1000).toFixed(2)}`,
            successRate: 98.5,
            peakHours: "7-10 PM",
            dateRange: "Oct 2024 - Dec 2024",
            totalVolume: `₹${(rowCount * 1200 / 1000000).toFixed(1)}M`
        })
    },
    {
        type: "fraud",
        filenamePrefix: "suspicious_activity_log",
        rowCountRange: [50000, 120000],
        nullPercentageRange: [5, 12],
        patterns: [
            "Rapid Fire Transactions",
            "International IP Cluster",
            "High Value Failures",
            "Velocity Check Trigger"
        ],
        insights: [
            "Unusual spike in international transactions (+400%)",
            "Detected 500+ accounts with shared device ID",
            "High failure rate (12%) on high-value transfers"
        ],
        baselines: (rowCount) => ({
            avgTransaction: `₹${(Math.random() * 2000 + 3000).toFixed(2)}`,
            successRate: 82.3,
            peakHours: "2-4 AM",
            dateRange: "Last 7 Days",
            riskScore: "HIGH (85/100)"
        })
    },
    {
        type: "churn",
        filenamePrefix: "user_retention_analysis",
        rowCountRange: [80000, 200000],
        nullPercentageRange: [2, 5],
        patterns: [
            "Declining Activity",
            "Dormant Accounts",
            "Failed Renewals",
            "Support Ticket Spike"
        ],
        insights: [
            "20% drop in active users over last 30 days",
            "High correlation between failed payments and churn",
            "User session duration down by 15%"
        ],
        baselines: (rowCount) => ({
            avgTransaction: `₹${(Math.random() * 300 + 800).toFixed(2)}`,
            successRate: 91.0,
            peakHours: "10 AM - 2 PM",
            dateRange: "Jan 2025 - Mar 2025",
            churnRate: "5.2%"
        })
    },
    {
        type: "gateway",
        filenamePrefix: "gateway_latency_logs",
        rowCountRange: [200000, 600000],
        nullPercentageRange: [8, 15],
        patterns: [
            "Timeout Spikes",
            "API Error 503",
            "Retry Storms",
            "Provider Downtime"
        ],
        insights: [
            "High latency detected on Payment Gateway B",
            "Timeout errors spiked to 8% during peak load",
            "Retry logic causing 3x load amplification"
        ],
        baselines: (rowCount) => ({
            avgTransaction: `₹${(Math.random() * 400 + 1100).toFixed(2)}`,
            successRate: 88.5,
            peakHours: "12 PM - 1 PM",
            dateRange: "Mar 15, 2025",
            avgLatency: "450ms"
        })
    },
    {
        type: "seasonal",
        filenamePrefix: "diwali_sale_transactions",
        rowCountRange: [500000, 1000000],
        nullPercentageRange: [1, 3],
        patterns: [
            "Extreme Volume Spike",
            "Flash Sale Burst",
            "Inventory Depletion",
            "New User Influx"
        ],
        insights: [
            "Transaction volume 5x normal daily average",
            "Server load reached 92% capacity",
            "Mobile traffic accounted for 78% of sales"
        ],
        baselines: (rowCount) => ({
            avgTransaction: `₹${(Math.random() * 600 + 1500).toFixed(2)}`,
            successRate: 96.8,
            peakHours: "6 PM - 11 PM",
            dateRange: "Nov 10 - Nov 15",
            peakTPS: "4,500"
        })
    }
];

export const generateFintechData = (): DataDNA => {
    // 1. Pick a random scenario
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

    // 2. Generate randomized metadata
    const rowCount = Math.floor(
        Math.random() * (scenario.rowCountRange[1] - scenario.rowCountRange[0]) +
        scenario.rowCountRange[0]
    );

    const timestamp = new Date().getTime();
    const filename = `${scenario.filenamePrefix}_${timestamp}.csv`;

    // 3. Generate columns (mix of standard and scenario-specific?)
    // For now, return a standard set but with randomized types/nulls
    const columns = [
        {
            name: "transaction_id",
            type: "text" as const,
            nullPercentage: 0,
            sampleValues: [`TXN_${Math.floor(Math.random() * 1000)}`, `TXN_${Math.floor(Math.random() * 1000)}`, `TXN_${Math.floor(Math.random() * 1000)}`],
        },
        {
            name: "amount",
            type: "numeric" as const,
            nullPercentage: 0,
            sampleValues: ["1200.50", "450.00", "8900.25"],
        },
        {
            name: "timestamp",
            type: "datetime" as const,
            nullPercentage: 0,
            sampleValues: ["2024-10-15 10:30:00", "2024-10-15 10:31:05", "2024-10-15 10:32:12"],
        },
        {
            name: "status",
            type: "categorical" as const,
            nullPercentage: Math.random() * 5,
            sampleValues: ["success", "failed", "pending"],
        },
        {
            name: "merchant_id",
            type: "text" as const,
            nullPercentage: 0,
            sampleValues: ["M_AMZ", "M_FLPKRT", "M_ZOMATO"],
        },
        {
            name: "customer_region",
            type: "categorical" as const,
            nullPercentage: Math.random() * 2,
            sampleValues: ["North", "South", "West", "East"],
        },
        {
            name: "device_type",
            type: "categorical" as const,
            nullPercentage: 0,
            sampleValues: ["Android", "iOS", "Web"],
        },
        {
            name: "payment_method",
            type: "categorical" as const,
            nullPercentage: 0,
            sampleValues: ["UPI", "Credit Card", "Net Banking"],
        }
    ];

    return {
        filename,
        rowCount,
        columnCount: columns.length,
        uploadDate: new Date(),
        columns,
        baselines: scenario.baselines(rowCount),
        patterns: scenario.patterns,
        insights: scenario.insights
    };
};
