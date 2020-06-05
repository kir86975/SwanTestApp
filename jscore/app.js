/**
 * Инициализация приложения
 */
Ext.application({
	name: 'SwanTestApp',
	paths: {
		'Swan': './jscore' // путь к классам Swan.*
	},
	requires: [
		'Swan.*' // необходимый файл для загрузки главного экрана приложения
	],
	autoCreateViewport: 'Swan.view.Main' // класс, используемый в качестве главного экрана приложения
});