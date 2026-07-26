export type DoctrineReference = {
  id: string;
  title: string;
  issuer: string;
  scope: string;
  url: string;
};

export const DOCTRINE_REFERENCES: DoctrineReference[] = [
  {
    id: 'gto-establishments',
    title: 'GTO Établissements et techniques d’extinction',
    issuer: 'Direction générale de la sécurité civile et de la gestion des crises',
    scope: 'Établissements hydrauliques, pertes de charge et principes de mise en œuvre.',
    url: 'https://pnrs.ensosp.fr/content/download/40517/668892/file/GTO-etablissements-techniques-extinction-2018.pdf',
  },
  {
    id: 'rddeci-78',
    title: 'Règlement départemental de défense extérieure contre l’incendie des Yvelines',
    issuer: 'Préfecture des Yvelines et SDIS 78',
    scope: 'Contrôle des PEI et mesure du débit à une pression dynamique de 1 bar.',
    url: 'https://www.sdis78.fr/storage/app/media/Conseils-aux-elus-et-exploitants/DECI/20170804-rddeci-78-signe-prefet-1.pdf',
  },
  {
    id: 'icpe-annex-vi',
    title: 'Annexe VI – Taux d’application et durées d’extinction',
    issuer: 'Légifrance',
    scope: 'Feux de liquides inflammables en installations classées avec stratégie faisant appel aux SIS.',
    url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000031175764',
  },
  {
    id: 'national-rddeci',
    title: 'Référentiel national de la défense extérieure contre l’incendie',
    issuer: 'Ministère de l’Intérieur',
    scope: 'Cadre national de la DECI, décliné par les règlements départementaux.',
    url: 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000031733868',
  },
];
