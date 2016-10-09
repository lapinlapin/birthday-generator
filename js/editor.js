'use strict';
var editorHB = angular.module('editorHB', []);

editorHB
	.factory('apiSrvc', ['$http', function($http) {
		return {
			getData: function(url) {
				return $http.get(url);
			}
		}
	}]);

editorHB
	.directive('generator', ['apiSrvc', function(apiSrvc) {
		return {
			restrict: 'A',
			scope: {
				editor: '@',
				birthday: '@'
			},
			link: function(scope, elem, attrs) {
				//сортировка после перемещения
				scope.sortedAfterMove = function() {
					var movesArr = [];
					$('.panel-editor-preview__item').each(function(ndx) {
						movesArr.push({
							index: ndx,
							left: $(this).offset().left
						});
					});

					return movesArr;
				};

				scope.subscribeDrag = function(ndx) {
					$('.panel-editor-preview__item').draggable({
						axis: 'x'
					});

					$('#name'+ndx).draggable();
					$('#text_second'+ndx).draggable();
					$('#text'+ndx).draggable();
					$('body').droppable({
						deactivate: function() {
							//имена
							scope.currentPost.nameX = parseInt($('#name'+ndx).css('left'));
							scope.currentPost.nameY = parseInt($('#name'+ndx).css('top'));
							//текст
							scope.currentPost.textX = parseInt($('#text'+ndx).css('left'));
							scope.currentPost.textY = parseInt($('#text'+ndx).css('top'));

							//текст2
							scope.currentPost.textX_second = parseInt($('#text_second'+ndx).css('left'));
							scope.currentPost.textY_second = parseInt($('#text_second'+ndx).css('top'));

							scope.$apply();
						}
					});

				};

				//флаг переключения сортировки
				scope.moving = true;

				//изначальный слайд = 0
				scope.currentNdxSlide = 0;

				//установка текущего слайда в превью
				scope.setCurrentSlide = function(ndx) {
					scope.currentNdxSlide = ndx;
					scope.getCurrentDataFromSlide();
				};

				//заглушка текущего поста
				scope.currentPost = {
					text: '',
					name: '',
					img: ''
				};

				//все посты с поздравлениями
				scope.posts = [];

				//конфиг ключей для сбора
				scope.confKeys = {
					1: 'name',
					2: 'text',
					3: 'img'
				};

				scope.$watch('currentNdxSlide', function(newV) {

					if (scope.currentNdxSlide == scope.posts.length - 1) {
						scope.hideNext = true;
						scope.hidePrev = false;
					} else {
						scope.hideNext = false;
					}

					if (scope.currentNdxSlide == 0) {
						scope.hidePrev = true;
						scope.hideNext = false;
					} else {
						scope.hidePrev = false;
					}

				});

				//следующая кнопка
				scope.next = function() {
					scope.currentNdxSlide++;
					scope.getCurrentDataFromSlide();
				};

				//предыдущая
				scope.prev = function() {
					scope.currentNdxSlide--;
					scope.getCurrentDataFromSlide();
				};

				//получить жсон
				scope.generateJSONafterEdit = function() {
					scope.startBtnActived = true;
					function sorted(a, b) {
						if (a.left > b.left) return 1;
						if (a.left < b.left) return -1;
						if (a.left == b.left) return 0;
					}

					scope.sortedAfterMove().forEach(function(newItem, i) {
						scope.posts[i].left = newItem.left;
					});

					var newPosts = scope.posts.sort(sorted);
					scope.posts = [];

					setTimeout(function() {
						scope.currentNdxSlide = 0;
						scope.posts = newPosts;
						scope.$apply();
						scope.finishJSON = JSON.stringify(scope.posts);
						scope.finished = true;
						scope.initSlick();
					}, 500);

				};

				//DEMO
				scope.start = function() {
					//предыдущая кнопка
					scope.generateJSONafterEdit();
					scope.editor = undefined;
					scope.birthday = scope.finishJSON;
					scope.initSlick();
				};

				//парсинг данных
				scope.parseInitDataAndGeneratePosts = function() {
					return apiSrvc.getData('data/data.html').then(function(res) {
						scope.domData = $(res).find('table tr');
						$(scope.domData.prevObject[0].data).find('tr').each(function(ndx, elem) {
							if (ndx > 2) { //пошли поздравления, минуя шапки
								var post = {};

								$(this).find('td').each(function(j, el) {
									if (scope.confKeys[j]) {
										var key = scope.confKeys[j];
										post[key] = el.innerText;
									}
								});
								scope.posts.push(post);
							}
						});
						//init slick, after generate posts
						scope.posts.forEach(function(post) {
							post.img = scope.checkImage(post.img) ? post.img : 'images/default.jpg';
						});
						scope.initSlick();


					});
				};

				scope.checkImage = function(img) {
					if (!img) {
						return false;
					}
					return ((img.indexOf(' ') == -1) && (img.indexOf('.png') > -1 || img.indexOf('.jpg') > -1 || img.indexOf('.jpeg') > -1));
				};
				//обновление слайда, после переключения
				scope.getCurrentDataFromSlide = function() {
					setTimeout(function() {

						//очистить модель от всех постов
						scope.posts.forEach(function(post) {
							delete post.current;
						});

						//получить текущий
						scope.currentPost = scope.posts[scope.currentNdxSlide];

						//установить текущий
						scope.currentPost.current = true;

						//инициализация
						//имена
						scope.currentPost.nameX = scope.currentPost.nameX || 100;
						scope.currentPost.nameY = scope.currentPost.nameY || 20;
						scope.currentPost.nameW = scope.currentPost.nameW || 100;
						scope.currentPost.nameColor = scope.currentPost.nameColor || '#fff';
						scope.currentPost.nameSize = scope.currentPost.nameSize || 38;
						scope.currentPost.nameFont = scope.currentPost.nameFont || 'Arial';

						//текст 1
						scope.currentPost.textX = scope.currentPost.textX || 100;
						scope.currentPost.textY = scope.currentPost.textY || 120;
						scope.currentPost.textW = scope.currentPost.textW || 350;
						scope.currentPost.textColor = scope.currentPost.textColor || '#fff';
						scope.currentPost.textSize = scope.currentPost.textSize || 38;
						scope.currentPost.textFont = scope.currentPost.textFont || 'Arial';

						//текст 2
						scope.currentPost.textX_second = scope.currentPost.textX_second || 100;
						scope.currentPost.textY_second = scope.currentPost.textY_second || 120;
						scope.currentPost.textW = scope.currentPost.textW || 350;
						scope.currentPost.textColor = scope.currentPost.textColor || '#fff';
						scope.currentPost.textSize = scope.currentPost.textSize || 38;
						scope.currentPost.textFont = scope.currentPost.textFont || 'Arial';

						scope.currentPost.img = scope.checkImage(scope.currentPost.img) ? scope.currentPost.img : 'images/default.jpg';

						scope.$apply();

						//подписаться на драг нового слайда, если редактирование
						if (scope.editor) {
							scope.subscribeDrag(scope.currentNdxSlide);
						}
					}, 200);
				};

				scope.initSlick = function() {
					scope.getCurrentDataFromSlide();

					//подписываемся на пикеры
					['nameColor', 'textColor'].forEach(function(picker) {
						scope[picker] = new CP(document.querySelector('.'+picker));
						scope[picker].on('change', function(color) {
							this.target.value = '#' + color;
							scope.currentPost[picker] = '#' + color;
							scope.$apply();
						});
					});
				};

				//режим с данными (прод)
				if (attrs.birthday) {
					scope.posts = JSON.parse(attrs.birthday);
					scope.initSlick();
				} else {
					//режим без данных (редактор)
					scope.parseInitDataAndGeneratePosts();
				}

			},
			templateUrl: 'tmpl/generator.html'
		}
	}]);