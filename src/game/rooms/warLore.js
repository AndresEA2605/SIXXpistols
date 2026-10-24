export const WAR_LOCATIONS = [
  { name: 'Refugio de San Telmo', scene: 'shelter', engraving: 'AQUÍ DESPERTÓ ARDAN ENTRE LOS SUPERVIVIENTES.' },
  { name: 'Plaza de las Campanas', scene: 'square', engraving: 'LA PRIMERA LÍNEA CEDIÓ AL SONAR LA TERCERA CAMPANA.' },
  { name: 'Trincheras del Este', scene: 'trenches', engraving: 'LA LLUVIA CUBRIÓ LAS HUELLAS, NO LOS NOMBRES.' },
  { name: 'Puente Quebrado', scene: 'bridge', engraving: 'EL CAPITÁN CERRÓ EL PASO PARA DAR TIEMPO A LA CIUDAD.', bossTitle: 'CAPITÁN DEL PUENTE' },
  { name: 'Hospital de Campaña', scene: 'hospital', engraving: 'LOS MÉDICOS NO DISTINGUIERON BANDOS EN LA OSCURIDAD.' },
  { name: 'Fundición del Norte', scene: 'foundry', engraving: 'DE AQUÍ SALIERON LAS ARMAS QUE DEFENDIERON LA MURALLA.' },
  { name: 'Molino de Pólvora', scene: 'mill', engraving: 'EL MOLINO ARDIÓ ANTES DE QUE MORO PUDIERA TOMARLO.', bossTitle: 'GUARDIÁN DE LA PÓLVORA' },
  { name: 'Avenida Sumergida', scene: 'flooded', engraving: 'BAJO EL AGUA AÚN REPOSAN LAS PUERTAS DE LAS CASAS.' },
  { name: 'Patio de los Estandartes', scene: 'banners', engraving: 'CADA TELA MARCABA UN BARRIO QUE SE NEGÓ A RENDIRSE.' },
  { name: 'Catedral de Ceniza', scene: 'cathedral', engraving: 'LAS CAMPANAS CALLARON; EL PUEBLO SIGUIÓ RESISTIENDO.', bossTitle: 'SACRISTÁN DE CENIZA' },
  { name: 'Distrito Sepultado', scene: 'buried', engraving: 'LAS VENTANAS SELLADAS GUARDAN CARTAS SIN ENVIAR.' },
  { name: 'Arsenal de Moro', scene: 'arsenal', engraving: 'EL ENEMIGO CONSERVÓ LOS NOMBRES DE SUS PRISIONEROS.' },
  { name: 'Foso de las Campanas', scene: 'bellpit', engraving: 'LA ÚLTIMA CAMPANA FUE ENTERRADA PARA QUE NO CAYERA.', bossTitle: 'CARCELERO DE LA CAMPANA' },
  { name: 'Muralla Interior', scene: 'wall', engraving: 'ARDAN JURÓ QUE NADIE CRUZARÍA ESTA PUERTA.' },
  { name: 'Campo de los Juramentos', scene: 'battlefield', engraving: 'AQUÍ CAYERON LOS SEIS BRAZOS Y TERMINÓ LA GUERRA.' },
  { name: 'Puerta Negra', scene: 'blackgate', engraving: 'LOS GENERALES DE MORO CUSTODIAN EL CAMINO AL PALACIO.', bossTitle: 'MARISCAL DE LA PUERTA' },
  { name: 'Fortaleza de Moro', scene: 'fortress', engraving: 'EL SILENCIO DEL PALACIO TERMINA CON EL NOMBRE DE MORO.' },
];

export const WAR_RELICS = [
  { id: 'standard_ribbon', name: 'Cinta del estandarte', glyph: '⚑', color: '#a84d69', look: 'ribbon', description: 'Una tira del estandarte de la Guardia del Sur. Ardan la anudó a su capa la noche en que los vecinos abrieron las puertas del refugio.' },
  { id: 'city_medal', name: 'Medalla de San Telmo', glyph: '✹', color: '#c5a66f', look: 'medal', description: 'La medalla se entregaba a quienes evacuaban civiles bajo fuego. El reverso lleva grabados los nombres de tres hermanas.' },
  { id: 'moro_insignia', name: 'Insignia quebrada', glyph: '✦', color: '#9c91b5', look: 'insignia', description: 'Una insignia arrancada a un oficial de Moro en el puente. La grieta conserva una marca de los seis brazos.' },
  { id: 'bell_charm', name: 'Amuleto de campana', glyph: '♧', color: '#8abac2', look: 'bell', description: 'Un pequeño badajo de plata, escondido por el sacristán antes de que sellaran la catedral. Aún vibra cuando Ardan se acerca a una reliquia.' },
  { id: 'mourning_cloak', name: 'Manto de luto', glyph: '◈', color: '#78648e', look: 'cloak', description: 'Tela cosida con retazos de los barrios caídos. No perteneció a un soldado: las familias la usaron para señalar el camino a casa.' },
];

export const WAR_RELIC_BY_ID = Object.fromEntries(WAR_RELICS.map((relic) => [relic.id, relic]));
