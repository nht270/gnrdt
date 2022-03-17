let generate = {
    index: (req, res) => {
        res.render('home')
    },

    generate: (req, res) => {

        // tam thoi
        // let schema = req.body.schema.tables[0]

        let { generateSqlCode } = require('../utils/sqlGenerate')

        let test = generateSqlCode(
            {
                databaseName: 'dbTest',
                type: 'SQL',
                fieldsSets: [
                    {
                        setName: 'lophoc',
                        references: [
                            {
                                fromField: "malh",
                                referenceTo: {
                                    toSetName: "sinhvien",
                                    toField: "malophoc",
                                    relation: "One2Many"
                                }
                            }
                        ],
                        primaryKeys: ['malh'],
                        unique: ['tenlh'],
                        autoIncrement: [
                            {
                                name: 'malh',
                                incrementPosition: 1,
                                startAt: '000',
                                step: 1
                            }
                        ],
                        fields:
                            [
                                {
                                    name: 'malh', datatype: {
                                        type: 'template',
                                        options: {
                                            template:
                                                [
                                                    { type: 'set', options: { set: ['P', 'PM'] } },
                                                    { type: 'string', options: { size: 3, haveLower: false, haveUpper: false, haveNumberic: true } },
                                                ]
                                        }
                                    }
                                },
                                { name: 'tenlh', datatype: { type: 'string', options: { size: 3 } } },
                            ],
                        rowAmount: 5
                    },
                    {
                        setName: 'sinhvien',
                        references: [
                            {
                                fromField: "mssv",
                                referenceTo: {
                                    toSetName: "sinhvien",
                                    toField: "mslt",
                                    relation: "One2One"
                                }
                            },
                            {
                                fromField: "mslt",
                                referenceTo: {
                                    toSetName: "sinhvien",
                                    toField: "mssv",
                                    relation: "One2One"
                                }
                            },
                            {
                                fromField: "malophoc",
                                referenceTo: {
                                    toSetName: "lophoc",
                                    toField: "malh",
                                    relation: "Many2One"
                                }
                            },
                            {
                                fromField: "msttv",
                                referenceTo: {
                                    toSetName: "thethuvien",
                                    toField: "mst",
                                    relation: "One2One"
                                }
                            },
                            {
                                fromField: "msttv",
                                referenceTo: {
                                    toSetName: "sachmuon",
                                    toField: "mst1",
                                    relation: "One2One"
                                }
                            },
                            {
                                fromField: "mssv",
                                referenceTo: {
                                    toSetName: "blhp",
                                    toField: "mssv",
                                    relation: "One2Many"
                                }
                            }
                        ],
                        primaryKeys: ['mssv'],
                        unique: ['age', 'mslt', 'msttv'],
                        autoIncrement: [
                            {
                                name: 'mssv',
                                incrementPosition: 3,
                                startAt: 'ABCDE',
                                step: 1
                            },
                            {
                                name: 'age',
                                incrementPosition: 0,
                                startAt: 18,
                                step: 1
                            }
                        ],
                        fields:
                            [
                                {
                                    name: 'mssv', datatype: {
                                        type: 'template',
                                        options: {
                                            template:
                                                [
                                                    { type: 'set', options: { set: ['DH', 'CD'] } },
                                                    { type: 'number', options: { min: 1, max: 5, isInt: true } },
                                                    { type: 'number', options: { min: 15, max: 22, isInt: true } },
                                                    { type: 'string', options: { size: 5, haveLower: false, haveUpper: true, haveNumberic: true } },
                                                ]
                                        }
                                    }
                                },
                                { name: 'name', datatype: { type: 'name', options: {} } },
                                { name: 'age', datatype: { type: 'number', options: { isInt: true, min: 18, max: 25 } } },
                                { name: 'address', datatype: { type: 'address' } },
                                {
                                    name: 'mslt', datatype: {
                                        type: 'template',
                                        options: {
                                            template:
                                                [
                                                    { type: 'set', options: { set: ['DH', 'CD'] } },
                                                    { type: 'number', options: { min: 1, max: 5, isInt: true } },
                                                    { type: 'number', options: { min: 15, max: 22, isInt: true } },
                                                    { type: 'string', options: { size: 5, haveLower: false, haveUpper: true, haveNumberic: true } },
                                                ]
                                        }
                                    }
                                },
                                {
                                    name: 'malophoc', datatype: {
                                        type: 'template',
                                        options: {
                                            template:
                                                [
                                                    { type: 'set', options: { set: ['P', 'PM'] } },
                                                    { type: 'string', options: { size: 3, haveLower: false, haveUpper: false, haveNumberic: true } },
                                                ]
                                        }
                                    }
                                },
                                {
                                    name: 'msttv', datatype: {
                                        type: 'template',
                                        options: {
                                            template:
                                                [
                                                    { type: 'set', options: { set: ['TT', 'TL'] } },
                                                    { type: 'number', options: { min: 1, max: 5, isInt: true } },
                                                ]
                                        }
                                    }
                                }
                            ],
                        rowAmount: 5
                    },
                    {
                        setName: 'thethuvien',
                        references: [
                            {
                                fromField: "mst",
                                referenceTo: {
                                    toSetName: "sinhvien",
                                    toField: "msttv",
                                    relation: "One2One"
                                }
                            },
                        ],
                        primaryKeys: ['mst'],
                        autoIncrement: [
                            {
                                name: 'mst',
                                incrementPosition: 1,
                                startAt: 0,
                                step: 1
                            },
                        ],
                        fields:
                            [
                                {
                                    name: 'mst', datatype: {
                                        type: 'template',
                                        options: {
                                            template:
                                                [
                                                    { type: 'set', options: { set: ['TT', 'TL'] } },
                                                    { type: 'number', options: { min: 1, max: 5, isInt: true } },
                                                ]
                                        }
                                    }
                                },
                                { name: 'name', datatype: { type: 'string', options: { size: 8 } } },
                            ],
                        rowAmount: 5
                    },
                    {
                        setName: 'sachmuon',
                        references: [
                            {
                                fromField: "mst1",
                                referenceTo: {
                                    toSetName: "sinhvien",
                                    toField: "msttv",
                                    relation: "One2One"
                                }
                            },
                        ],
                        primaryKeys: [],
                        unique: ['mst1'],
                        autoIncrement: [],
                        fields:
                            [
                                {
                                    name: 'mst1', datatype: {
                                        type: 'template',
                                        options: {
                                            template:
                                                [
                                                    { type: 'set', options: { set: ['TT', 'TL'] } },
                                                    { type: 'number', options: { min: 1, max: 5, isInt: true } },
                                                ]
                                        }
                                    }
                                },
                                { name: 'name', datatype: { type: 'string', options: { size: 8 } } },
                            ],
                        rowAmount: 5
                    },

                    {
                        setName: 'blhp',
                        references: [
                            {
                                fromField: "mssv",
                                referenceTo: {
                                    toSetName: "sinhvien",
                                    toField: "mssv",
                                    relation: "Many2One"
                                }
                            },
                        ],
                        primaryKeys: ['mbl'],
                        unique: ['mbl'],
                        autoIncrement: [
                            {
                                name: 'mbl',
                                incrementPosition: 0,
                                startAt: 10,
                                step: 10
                            }
                        ],
                        fields:
                            [
                                {
                                    name: 'mbl',
                                    datatype: { type: 'number', options: { min: 1, max: 5, isInt: true } }
                                },
                                {
                                    name: 'mssv',
                                    datatype: {
                                        type: 'template',
                                        options: {
                                            template:
                                                [
                                                    { type: 'set', options: { set: ['DH', 'CD'] } },
                                                    { type: 'number', options: { min: 1, max: 5, isInt: true } },
                                                    { type: 'number', options: { min: 15, max: 22, isInt: true } },
                                                    { type: 'string', options: { size: 5, haveLower: false, haveUpper: false, haveNumberic: true } },
                                                ]
                                        }
                                    }
                                },
                                {
                                    name: 'price',
                                    datatype: { type: 'number', options: { min: 1000, max: 20000000, isInt: true } }
                                }
                            ],
                        rowAmount: 24
                    }
                ]
            }, true, false)

        res.send(test)
    }
}

module.exports = generate