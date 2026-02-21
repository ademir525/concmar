// Dados dos Concursos da Marinha do Brasil 2026
window.CONCURSOS_MARINHA = [
  {
    id: "cfn",
    nome: "Soldado Fuzileiro Naval (CFN)",
    sigla: "CFN",
    descricao: "Curso de Formação de Soldados Fuzileiros Navais - Turmas I e II/2027",
    taxaInscricao: 40.00,
    vagas: 1680,
    salarioDurante: "R$ 1.424,26",
    salarioApos: "R$ 2.505,10",
    escolaridade: "Ensino Médio Completo",
    inscricaoInicio: "19/02/2026",
    inscricaoFim: "20/03/2026",
    provaData: "A definir",
    site: "www.marinha.mil.br/cgcfn",
    cargos: [
      {
        id: "soldado-fuzileiro",
        nome: "Soldado Fuzileiro Naval",
        vagas: 1680,
        salario: "R$ 2.505,10"
      }
    ]
  },
  {
    id: "eam",
    nome: "Escolas de Aprendizes-Marinheiros (EAM)",
    sigla: "EAM",
    descricao: "Concurso de Admissão às Escolas de Aprendizes-Marinheiros 2026",
    taxaInscricao: 40.00,
    vagas: 850,
    salarioDurante: "R$ 1.303,90",
    salarioApos: "R$ 2.294,50",
    escolaridade: "Ensino Médio Completo ou em Conclusão",
    inscricaoInicio: "27/01/2026",
    inscricaoFim: "25/02/2026",
    provaData: "26/04/2026",
    site: "concursos.marinha.mil.br",
    cargos: [
      {
        id: "marinheiro-apoio",
        nome: "Marinheiro - Área de Apoio",
        vagas: null,
        salario: "R$ 2.294,50"
      },
      {
        id: "marinheiro-eletroeletronica",
        nome: "Marinheiro - Área de Eletroeletrônica",
        vagas: null,
        salario: "R$ 2.294,50"
      },
      {
        id: "marinheiro-mecanica",
        nome: "Marinheiro - Área de Mecânica",
        vagas: null,
        salario: "R$ 2.294,50"
      }
    ]
  },
  {
    id: "oficiais",
    nome: "Oficiais da Marinha (Nível Superior)",
    sigla: "CP-QC",
    descricao: "Concurso para ingresso no Corpo de Engenheiros, Quadro de Saúde, Quadro Técnico e Quadro de Capelães Navais",
    taxaInscricao: 150.00,
    vagas: 128,
    salarioDurante: "R$ 9.663,60",
    salarioApos: "R$ 9.663,60+",
    escolaridade: "Nível Superior",
    inscricaoInicio: "10/03/2026",
    inscricaoFim: "08/04/2026",
    provaData: "24/05/2026",
    site: "www.ingressonamarinha.mar.mil.br",
    cargos: [
      // Corpo de Engenheiros
      {
        id: "eng-naval",
        nome: "Engenheiro Naval",
        categoria: "Corpo de Engenheiros",
        vagas: 2,
        salario: "R$ 9.663,60"
      },
      {
        id: "eng-mecanica",
        nome: "Engenheiro Mecânico",
        categoria: "Corpo de Engenheiros",
        vagas: 5,
        salario: "R$ 9.663,60"
      },
      {
        id: "eng-eletrica",
        nome: "Engenheiro Elétrico",
        categoria: "Corpo de Engenheiros",
        vagas: 4,
        salario: "R$ 9.663,60"
      },
      {
        id: "eng-eletronica",
        nome: "Engenheiro Eletrônico",
        categoria: "Corpo de Engenheiros",
        vagas: 3,
        salario: "R$ 9.663,60"
      },
      {
        id: "eng-civil",
        nome: "Engenheiro Civil",
        categoria: "Corpo de Engenheiros",
        vagas: 2,
        salario: "R$ 9.663,60"
      },
      // Quadro Técnico
      {
        id: "qt-direito",
        nome: "Oficial do Quadro Técnico - Direito",
        categoria: "Quadro Técnico",
        vagas: 5,
        salario: "R$ 9.663,60"
      },
      {
        id: "qt-ti-sistemas",
        nome: "Oficial do Quadro Técnico - TI (Desenvolvimento de Sistemas)",
        categoria: "Quadro Técnico",
        vagas: 3,
        salario: "R$ 9.663,60"
      },
      {
        id: "qt-ti-infra",
        nome: "Oficial do Quadro Técnico - TI (Infraestrutura)",
        categoria: "Quadro Técnico",
        vagas: 3,
        salario: "R$ 9.663,60"
      },
      {
        id: "qt-ti-seguranca",
        nome: "Oficial do Quadro Técnico - TI (Segurança da Informação)",
        categoria: "Quadro Técnico",
        vagas: 2,
        salario: "R$ 9.663,60"
      },
      // Quadro de Saúde - Médicos
      {
        id: "medico-cardiologia",
        nome: "Médico - Cardiologia",
        categoria: "Quadro de Médicos",
        vagas: 3,
        salario: "R$ 9.663,60"
      },
      {
        id: "medico-clinica",
        nome: "Médico - Clínica Médica",
        categoria: "Quadro de Médicos",
        vagas: 3,
        salario: "R$ 9.663,60"
      },
      {
        id: "medico-intensiva",
        nome: "Médico - Medicina Intensiva",
        categoria: "Quadro de Médicos",
        vagas: 3,
        salario: "R$ 9.663,60"
      },
      {
        id: "medico-ortopedia",
        nome: "Médico - Ortopedia e Traumatologia",
        categoria: "Quadro de Médicos",
        vagas: 3,
        salario: "R$ 9.663,60"
      },
      // Cirurgiões-Dentistas
      {
        id: "dentista-protese",
        nome: "Cirurgião-Dentista - Prótese Dentária",
        categoria: "Quadro de Cirurgiões-Dentistas",
        vagas: null,
        salario: "R$ 9.663,60"
      },
      {
        id: "dentista-ortodontia",
        nome: "Cirurgião-Dentista - Ortodontia",
        categoria: "Quadro de Cirurgiões-Dentistas",
        vagas: null,
        salario: "R$ 9.663,60"
      },
      // Apoio à Saúde
      {
        id: "enfermagem",
        nome: "Oficial de Apoio à Saúde - Enfermagem",
        categoria: "Quadro de Apoio à Saúde",
        vagas: 3,
        salario: "R$ 9.663,60"
      },
      {
        id: "farmacia",
        nome: "Oficial de Apoio à Saúde - Farmácia",
        categoria: "Quadro de Apoio à Saúde",
        vagas: null,
        salario: "R$ 9.663,60"
      },
      {
        id: "fisioterapia",
        nome: "Oficial de Apoio à Saúde - Fisioterapia",
        categoria: "Quadro de Apoio à Saúde",
        vagas: null,
        salario: "R$ 9.663,60"
      },
      // Capelães
      {
        id: "capelao-catolico",
        nome: "Capelão Naval - Católico Apostólico Romano",
        categoria: "Quadro de Capelães Navais",
        vagas: null,
        salario: "R$ 9.663,60"
      },
      {
        id: "capelao-batista",
        nome: "Capelão Naval - Batista",
        categoria: "Quadro de Capelães Navais",
        vagas: null,
        salario: "R$ 9.663,60"
      }
    ]
  },
  {
    id: "smv",
    nome: "Oficiais Temporários da Marinha (SMV)",
    sigla: "SMV",
    descricao: "Serviço Militar Voluntário de Praças Temporários - 794 vagas em todo o País",
    taxaInscricao: 140.00,
    vagas: 794,
    salarioDurante: "R$ 1.398,30",
    salarioApos: "R$ 3.835,42",
    escolaridade: "Ensino Médio Técnico ou Fundamental com C-FIC",
    inscricaoInicio: "09/12/2025",
    inscricaoFim: "27/01/2026",
    provaData: "15/03/2026",
    site: "www.marinha.mil.br",
    cargos: [
      {
        id: "smv-administracao",
        nome: "Praça Temporário - Administração",
        categoria: "Área de Apoio",
        vagas: null,
        salario: "R$ 3.835,42"
      },
      {
        id: "smv-direito",
        nome: "Praça Temporário - Direito",
        categoria: "Área de Apoio",
        vagas: null,
        salario: "R$ 3.835,42"
      },
      {
        id: "smv-engenharia",
        nome: "Praça Temporário - Engenharia",
        categoria: "Área Industrial",
        vagas: null,
        salario: "R$ 3.835,42"
      },
      {
        id: "smv-ti",
        nome: "Praça Temporário - Tecnologia da Informação",
        categoria: "Área de Apoio",
        vagas: null,
        salario: "R$ 3.835,42"
      },
      {
        id: "smv-saude",
        nome: "Praça Temporário - Saúde",
        categoria: "Área de Saúde",
        vagas: null,
        salario: "R$ 3.835,42"
      },
      {
        id: "smv-educacao",
        nome: "Praça Temporário - Educação",
        categoria: "Área de Apoio",
        vagas: null,
        salario: "R$ 3.835,42"
      },
      {
        id: "smv-comunicacao",
        nome: "Praça Temporário - Comunicação",
        categoria: "Área de Apoio",
        vagas: null,
        salario: "R$ 3.835,42"
      }
    ]
  },
  {
    id: "sargento-musico",
    nome: "Sargento Músico Fuzileiro Naval",
    sigla: "SGT-MUS",
    descricao: "Concurso para Sargentos Músicos do Corpo de Fuzileiros Navais",
    taxaInscricao: 95.00,
    vagas: 40,
    salarioDurante: "R$ 3.825,00",
    salarioApos: "R$ 6.200,00+",
    escolaridade: "Ensino Médio Completo",
    inscricaoInicio: "17/12/2025",
    inscricaoFim: "20/03/2026",
    provaData: "A definir",
    site: "www.marinha.mil.br/cgcfn",
    cargos: [
      {
        id: "sgt-saxofone",
        nome: "Sargento Músico - Saxofone",
        categoria: "Instrumentos de Sopro",
        vagas: null,
        salario: "R$ 6.200,00+"
      },
      {
        id: "sgt-trompete",
        nome: "Sargento Músico - Trompete",
        categoria: "Instrumentos de Sopro",
        vagas: null,
        salario: "R$ 6.200,00+"
      },
      {
        id: "sgt-percussao",
        nome: "Sargento Músico - Percussão",
        categoria: "Instrumentos de Percussão",
        vagas: null,
        salario: "R$ 6.200,00+"
      },
      {
        id: "sgt-clarinete",
        nome: "Sargento Músico - Clarinete",
        categoria: "Instrumentos de Sopro",
        vagas: null,
        salario: "R$ 6.200,00+"
      },
      {
        id: "sgt-trombone",
        nome: "Sargento Músico - Trombone",
        categoria: "Instrumentos de Sopro",
        vagas: null,
        salario: "R$ 6.200,00+"
      }
    ]
  }
];

// Função para obter concurso por ID
window.getConcursoById = function(id) {
  return window.CONCURSOS_MARINHA.find(c => c.id === id);
};

// Função para formatar moeda
window.formatCurrency = function(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

console.log('Sistema de Concursos da Marinha do Brasil carregado');
console.log('Total de concursos disponíveis:', window.CONCURSOS_MARINHA.length);
