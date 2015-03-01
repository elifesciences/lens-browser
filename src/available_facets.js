var AVAILABLE_FACETS = {
  "article_type": {
    "doc_count_error_upper_bound": 0,
    "sum_other_doc_count": 0,
    "buckets": [
      {
        "key": "Research article",
        "doc_count": 796
      },
      {
        "key": "Insight",
        "doc_count": 179
      },
      {
        "key": "Correction",
        "doc_count": 41
      },
      {
        "key": "Feature article",
        "doc_count": 32
      },
      {
        "key": "Short report",
        "doc_count": 27
      },
      {
        "key": "Editorial",
        "doc_count": 11
      },
      {
        "key": "Research advance",
        "doc_count": 10
      },
      {
        "key": "Registered report",
        "doc_count": 6
      },
      {
        "key": "Feature Article",
        "doc_count": 1
      }
    ]
  },
  "subjects": {
    "doc_count_error_upper_bound": 0,
    "sum_other_doc_count": 0,
    "buckets": [
      {
        "key": "Cell biology",
        "doc_count": 275
      },
      {
        "key": "Neuroscience",
        "doc_count": 239
      },
      {
        "key": "Biophysics and structural biology",
        "doc_count": 208
      },
      {
        "key": "Biochemistry",
        "doc_count": 177
      },
      {
        "key": "Developmental biology and stem cells",
        "doc_count": 151
      },
      {
        "key": "Genomics and evolutionary biology",
        "doc_count": 138
      },
      {
        "key": "Genes and chromosomes",
        "doc_count": 120
      },
      {
        "key": "Microbiology and infectious disease",
        "doc_count": 106
      },
      {
        "key": "Human biology and medicine",
        "doc_count": 82
      },
      {
        "key": "Immunology",
        "doc_count": 58
      },
      {
        "key": "Plant biology",
        "doc_count": 48
      },
      {
        "key": "Ecology",
        "doc_count": 25
      },
      {
        "key": "Epidemiology and global health",
        "doc_count": 19
      },
      {
        "key": "Computational and systems biology",
        "doc_count": 1
      }
    ]
  },
  "organisms": {
    "doc_count_error_upper_bound": 0,
    "sum_other_doc_count": 246,
    "buckets": [
      {
        "key": "mouse",
        "doc_count": 176
      },
      {
        "key": "human",
        "doc_count": 169
      },
      {
        "key": "Mouse",
        "doc_count": 127
      },
      {
        "key": "Human",
        "doc_count": 112
      },
      {
        "key": "other",
        "doc_count": 108
      },
      {
        "key": "D. melanogaster",
        "doc_count": 105
      },
      {
        "key": "S. cerevisiae",
        "doc_count": 91
      },
      {
        "key": "E. coli",
        "doc_count": 77
      },
      {
        "key": "Other",
        "doc_count": 49
      },
      {
        "key": "Arabidopsis",
        "doc_count": 37
      }
    ]
  },
  "authors": {
    "doc_count_error_upper_bound": 4,
    "sum_other_doc_count": 6627,
    "buckets": [
      {
        "key": "Randy Schekman",
        "doc_count": 14
      },
      {
        "key": "Eve Marder",
        "doc_count": 8
      },
      {
        "key": "Detlef Weigel",
        "doc_count": 7
      },
      {
        "key": "Bill S Hansson",
        "doc_count": 6
      },
      {
        "key": "Chris P Ponting",
        "doc_count": 6
      },
      {
        "key": "Fiona M Watt",
        "doc_count": 5
      },
      {
        "key": "Peter Walter",
        "doc_count": 5
      },
      {
        "key": "Alma L Burlingame",
        "doc_count": 4
      },
      {
        "key": "Irene Farabella",
        "doc_count": 4
      },
      {
        "key": "Maya Topf",
        "doc_count": 4
      }
    ]
  }
};


// var AVAILABLE_FACETS = {
//   "subjects": {
//     "name": "Subjects",
//     "entries": [
//       {"name": "Biochemistry", "frequency": 0},
//       {"name": "Biophysics and structural biology", "frequency": 0},
//       {"name": "Cancer biology", "frequency": 0},
//       {"name": "Cell biology", "frequency": 0},
//       {"name": "Computational and systems biology", "frequency": 0},
//       {"name": "Developmental biology and stem cells", "frequency": 0},
//       {"name": "Ecology", "frequency": 0},
//       {"name": "Epidemiology and global health", "frequency": 0},
//       {"name": "Genes and chromosomes", "frequency": 0},
//       {"name": "Genomics and evolutionary biology", "frequency": 0},
//       {"name": "Human biology and medicine", "frequency": 0},
//       {"name": "Immunology", "frequency": 0},
//       {"name": "Microbiology and infectious disease", "frequency": 0},
//       {"name": "Neuroscience", "frequency": 0},
//       {"name": "Plant biology", "frequency": 0}
//     ]
//   },
//   "article_type": {
//     "name": "Content Type",
//     "entries": [
//       {"name": "Editorial", "frequency": 0},
//       {"name": "Feature article", "frequency": 0},
//       {"name": "Insight", "frequency": 0},
//       {"name": "Research article", "frequency": 0},
//       {"name": "Short report", "frequency": 0},
//       {"name": "Research advance", "frequency": 0},
//       {"name": "Registered report", "frequency": 0},
//       {"name": "Correction", "frequency": 0}
//     ]
//   },
//   "organisms": {
//     "name": "Research organism",
//     "entries": [
//       {"name": "Mouse", "frequency": 0},
//       {"name": "Human", "frequency": 0},
//       {"name": "Rat", "frequency": 0},
//       {"name": "Zebrafish", "frequency": 0},
//       {"name": "C. elegans", "frequency": 0},
//       {"name": "D. melanogaster", "frequency": 0}
//     ]
//   },
//   "authors": {
//     "name": "Author",
//     "entries": [
//     ]
//   }
// };



module.exports = AVAILABLE_FACETS;