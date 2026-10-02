// =========================================================
// DAYDREAMERS
// CA INTERMEDIATE SYLLABUS DATA
// =========================================================
//
// IMPORTANT:
// This file keeps the syllabus separate from the website UI.
// That means we can change the syllabus later without
// rebuilding the entire website.
//
// The structure is:
//
// Subject
//   -> Module / Part / Section
//      -> Chapter
//         -> Unit / Topic (where applicable)
// =========================================================


const CA_INTERMEDIATE_SYLLABUS = [

    // =====================================================
    // 1. ADVANCED ACCOUNTING
    // =====================================================

    {
        id: "advanced-accounting",
        name: "Advanced Accounting",
        shortName: "Accounts",
        icon: "📘",

        sections: [

            {
                id: "aa-module-1",
                name: "Module 1: Accounting Standards & Framework",

                chapters: [

                    {
                        id: "aa-1",
                        name: "Introduction to Accounting Standards"
                    },

                    {
                        id: "aa-2",
                        name: "Framework for Preparation and Presentation of Financial Statements"
                    },

                    {
                        id: "aa-3",
                        name: "Applicability of Accounting Standards"
                    },

                    {
                        id: "aa-4",
                        name: "Presentation and Disclosure-Based Accounting Standards",

                        topics: [
                            "AS 1",
                            "AS 3",
                            "AS 17",
                            "AS 18",
                            "AS 20",
                            "AS 24",
                            "AS 25"
                        ]
                    }

                ]
            },


            {
                id: "aa-module-2",
                name: "Module 2: Asset & Performance Standards",

                chapters: [

                    {
                        id: "aa-5",
                        name: "Valuation of Inventory (AS 2)"
                    },

                    {
                        id: "aa-6",
                        name: "Property, Plant and Equipment (AS 10)"
                    },

                    {
                        id: "aa-7",
                        name: "Investments (AS 13)"
                    },

                    {
                        id: "aa-8",
                        name: "Borrowing Costs (AS 16)"
                    },

                    {
                        id: "aa-9",
                        name: "Leases (AS 19)"
                    },

                    {
                        id: "aa-10",
                        name: "Intangible Assets (AS 26)"
                    },

                    {
                        id: "aa-11",
                        name: "Impairment of Assets (AS 28)"
                    },

                    {
                        id: "aa-12",
                        name: "Contingencies (AS 4)"
                    },

                    {
                        id: "aa-13",
                        name: "Net Profit/Loss (AS 5)"
                    },

                    {
                        id: "aa-14",
                        name: "Foreign Exchange Rates (AS 11)"
                    },

                    {
                        id: "aa-15",
                        name: "Taxes on Income (AS 22)"
                    },

                    {
                        id: "aa-16",
                        name: "Government Grants (AS 12)"
                    },

                    {
                        id: "aa-17",
                        name: "Amalgamations (AS 14)"
                    }

                ]
            },


            {
                id: "aa-module-3",
                name: "Module 3: Advanced Topics and Company Accounts",

                chapters: [

                    {
                        id: "aa-18",
                        name: "Application of Consolidated Financial Statements (AS 21, AS 23, AS 27)"
                    },

                    {
                        id: "aa-19",
                        name: "Financial Statements of Companies"
                    },

                    {
                        id: "aa-20",
                        name: "Buyback of Equity Shares and Securities"
                    },

                    {
                        id: "aa-21",
                        name: "Accounting for Reconstruction of Companies (Internal Reconstruction)"
                    },

                    {
                        id: "aa-22",
                        name: "Amalgamation of Companies"
                    },

                    {
                        id: "aa-23",
                        name: "Accounting for Branches, including Foreign Branches"
                    },

                    {
                        id: "aa-24",
                        name: "Cash Flow Statements"
                    }

                ]
            }

        ]
    },


    // =====================================================
    // 2. CORPORATE AND OTHER LAWS
    // =====================================================

    {
        id: "corporate-other-laws",
        name: "Corporate and Other Laws",
        shortName: "Law",
        icon: "⚖️",

        sections: [

            {
                id: "law-part-1",
                name: "Part I: Company Law and LLP Law (70 Marks)",

                chapters: [

                    {
                        id: "law-1",
                        name: "Preliminary"
                    },

                    {
                        id: "law-2",
                        name: "Incorporation"
                    },

                    {
                        id: "law-3",
                        name: "Prospectus and Allotment"
                    },

                    {
                        id: "law-4",
                        name: "Share Capital and Debentures"
                    },

                    {
                        id: "law-5",
                        name: "Deposits"
                    },

                    {
                        id: "law-6",
                        name: "Registration of Charges"
                    },

                    {
                        id: "law-7",
                        name: "Management and Administration"
                    },

                    {
                        id: "law-8",
                        name: "Dividend"
                    },

                    {
                        id: "law-9",
                        name: "Accounts"
                    },

                    {
                        id: "law-10",
                        name: "Audit and Auditors"
                    },

                    {
                        id: "law-11",
                        name: "Foreign Companies"
                    },

                    {
                        id: "law-12",
                        name: "Limited Liability Partnership Act, 2008"
                    }

                ]
            },


            {
                id: "law-part-2",
                name: "Part II: Other Laws (30 Marks)",

                chapters: [

                    {
                        id: "law-13",
                        name: "General Clauses Act, 1897"
                    },

                    {
                        id: "law-14",
                        name: "Interpretation of Statutes"
                    },

                    {
                        id: "law-15",
                        name: "Foreign Exchange Management Act, 1999 (FEMA)"
                    }

                ]
            }

        ]
    },


    // =====================================================
    // 3. TAXATION
    // =====================================================

    {
        id: "taxation",
        name: "Taxation",
        shortName: "Taxation",
        icon: "💰",

        sections: [

            // -------------------------------------------------
            // INCOME TAX
            // -------------------------------------------------

            {
                id: "tax-income-tax",
                name: "Section A: Income-tax Law",

                modules: [

                    {
                        id: "income-tax-module-1",
                        name: "Module 1",

                        chapters: [

                            {
                                id: "it-1",
                                name: "Basic Concepts"
                            },

                            {
                                id: "it-2",
                                name: "Residence and Scope of Total Income"
                            },

                            {
                                id: "it-3",
                                name: "Heads of Income",

                                units: [

                                    {
                                        id: "it-3-u1",
                                        name: "Unit 1: Salaries"
                                    },

                                    {
                                        id: "it-3-u2",
                                        name: "Unit 2: Income from House Property"
                                    },

                                    {
                                        id: "it-3-u3",
                                        name: "Unit 3: PGBP"
                                    },

                                    {
                                        id: "it-3-u4",
                                        name: "Unit 4: Capital Gains"
                                    },

                                    {
                                        id: "it-3-u5",
                                        name: "Unit 5: Income from Other Sources"
                                    }

                                ]
                            }

                        ]
                    },


                    {
                        id: "income-tax-module-2",
                        name: "Module 2",

                        chapters: [

                            {
                                id: "it-4",
                                name: "Clubbing of Income"
                            },

                            {
                                id: "it-5",
                                name: "Set-off and Carry Forward of Losses"
                            },

                            {
                                id: "it-6",
                                name: "Deductions under Chapter VI-A"
                            },

                            {
                                id: "it-7",
                                name: "TDS/TCS and Advance Tax"
                            },

                            {
                                id: "it-8",
                                name: "Return Filing and Self-Assessment"
                            },

                            {
                                id: "it-9",
                                name: "Final Tax Computation and Optimization"
                            }

                        ]
                    }

                ]
            },


            // -------------------------------------------------
            // GST
            // -------------------------------------------------

            {
                id: "tax-gst",
                name: "Section B: GST",

                modules: [

                    {
                        id: "gst-module-1",
                        name: "Module 1",

                        chapters: [

                            {
                                id: "gst-1",
                                name: "GST in India – An Introduction"
                            },

                            {
                                id: "gst-2",
                                name: "Supply under GST"
                            },

                            {
                                id: "gst-3",
                                name: "Charge of GST"
                            },

                            {
                                id: "gst-4",
                                name: "Place of Supply"
                            },

                            {
                                id: "gst-5",
                                name: "Exemptions from GST"
                            },

                            {
                                id: "gst-6",
                                name: "Time of Supply"
                            },

                            {
                                id: "gst-7",
                                name: "Value of Supply"
                            }

                        ]
                    },


                    {
                        id: "gst-module-2",
                        name: "Module 2",

                        chapters: [

                            {
                                id: "gst-8",
                                name: "Input Tax Credit"
                            },

                            {
                                id: "gst-9",
                                name: "Registration"
                            },

                            {
                                id: "gst-10",
                                name: "Tax Invoice; Credit and Debit Notes"
                            },

                            {
                                id: "gst-11",
                                name: "Accounts and Records"
                            },

                            {
                                id: "gst-12",
                                name: "E-Way Bill"
                            },

                            {
                                id: "gst-13",
                                name: "Payment of Tax"
                            },

                            {
                                id: "gst-14",
                                name: "TDS/TCS"
                            },

                            {
                                id: "gst-15",
                                name: "Returns"
                            }

                        ]
                    }

                ]
            }

        ]
    },


    // =====================================================
    // 4. COST AND MANAGEMENT ACCOUNTING
    // =====================================================

    {
        id: "cost-management-accounting",
        name: "Cost and Management Accounting",
        shortName: "Costing",
        icon: "🧮",

        sections: [

            {
                id: "cost-module-1",
                name: "Module 1",

                chapters: [

                    {
                        id: "cost-1",
                        name: "Introduction"
                    },

                    {
                        id: "cost-2",
                        name: "Material Cost"
                    },

                    {
                        id: "cost-3",
                        name: "Employee Cost and Direct Expenses"
                    },

                    {
                        id: "cost-4",
                        name: "Overheads – Absorption Costing Method"
                    },

                    {
                        id: "cost-5",
                        name: "Activity Based Costing"
                    },

                    {
                        id: "cost-6",
                        name: "Cost Sheet"
                    },

                    {
                        id: "cost-7",
                        name: "Cost Accounting Systems"
                    }

                ]
            },


            {
                id: "cost-module-2",
                name: "Module 2",

                chapters: [

                    {
                        id: "cost-8",
                        name: "Unit & Batch Costing"
                    },

                    {
                        id: "cost-9",
                        name: "Job Costing and Contract Costing"
                    },

                    {
                        id: "cost-10",
                        name: "Process & Operation Costing"
                    },

                    {
                        id: "cost-11",
                        name: "Joint Products and By Products"
                    },

                    {
                        id: "cost-12",
                        name: "Service Costing"
                    },

                    {
                        id: "cost-13",
                        name: "Standard Costing"
                    },

                    {
                        id: "cost-14",
                        name: "Marginal Costing"
                    },

                    {
                        id: "cost-15",
                        name: "Budgets and Budgetary Control"
                    }

                ]
            }

        ]
    },


    // =====================================================
    // 5. AUDITING AND ETHICS
    // =====================================================

    {
        id: "auditing-ethics",
        name: "Auditing and Ethics",
        shortName: "Audit",
        icon: "🔍",

        sections: [

            {
                id: "audit-module-1",
                name: "Module 1",

                chapters: [

                    {
                        id: "audit-1",
                        name: "Nature, Objective and Scope of Audit"
                    },

                    {
                        id: "audit-2",
                        name: "Audit Strategy, Audit Planning and Audit Programme"
                    },

                    {
                        id: "audit-3",
                        name: "Risk Assessment and Internal Control"
                    },

                    {
                        id: "audit-4",
                        name: "Audit Evidence"
                    },

                    {
                        id: "audit-5",
                        name: "Audit of Items of Financial Statements"
                    }

                ]
            },


            {
                id: "audit-module-2",
                name: "Module 2",

                chapters: [

                    {
                        id: "audit-6",
                        name: "Audit Documentation"
                    },

                    {
                        id: "audit-7",
                        name: "Completion and Review"
                    },

                    {
                        id: "audit-8",
                        name: "Audit Report"
                    },

                    {
                        id: "audit-9",
                        name: "Special Features of Audit of Different Type of Entities"
                    },

                    {
                        id: "audit-10",
                        name: "Audit of Banks"
                    },

                    {
                        id: "audit-11",
                        name: "Ethics and Terms of Audit Engagements"
                    }

                ]
            }

        ]
    },


    // =====================================================
    // 6. FINANCIAL MANAGEMENT AND STRATEGIC MANAGEMENT
    // =====================================================

    {
        id: "fm-sm",
        name: "Financial Management and Strategic Management",
        shortName: "FM & SM",
        icon: "📈",

        sections: [

            // -------------------------------------------------
            // FINANCIAL MANAGEMENT
            // -------------------------------------------------

            {
                id: "fm-section",
                name: "Section A: Financial Management",

                chapters: [

                    {
                        id: "fm-1",
                        name: "Scope and Objectives of FM"
                    },

                    {
                        id: "fm-2",
                        name: "Types of Financing"
                    },

                    {
                        id: "fm-3",
                        name: "Ratio Analysis"
                    },

                    {
                        id: "fm-4",
                        name: "Cost of Capital"
                    },

                    {
                        id: "fm-5",
                        name: "Capital Structure"
                    },

                    {
                        id: "fm-6",
                        name: "Leverages"
                    },

                    {
                        id: "fm-7",
                        name: "Investment Decisions"
                    },

                    {
                        id: "fm-8",
                        name: "Dividend Decisions"
                    },

                    {
                        id: "fm-9",
                        name: "Working Capital Management"
                    }

                ]
            },


            // -------------------------------------------------
            // STRATEGIC MANAGEMENT
            // -------------------------------------------------

            {
                id: "sm-section",
                name: "Section B: Strategic Management",

                chapters: [

                    {
                        id: "sm-1",
                        name: "Introduction to Strategic Management"
                    },

                    {
                        id: "sm-2",
                        name: "External and Internal Environmental Analysis"
                    },

                    {
                        id: "sm-3",
                        name: "Strategic Choices"
                    },

                    {
                        id: "sm-4",
                        name: "Strategy Implementation and Evaluation"
                    }

                ]
            }

        ]
    }

];