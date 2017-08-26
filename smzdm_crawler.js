
'use strict'

var request = require('request');

// “发现”频道首页
// 根据 article_date 参数指定的时间来获取最近爆料项目
var FAXIAN_JSON = 'https://faxian.m.smzdm.com/ajax_faxian_list_show?article_date=';

// 获取评论
// POST 参数 “page_on=页码” 来获取评论
var COMMENT_JSON = 'https://m.smzdm.com/comment/ajax_get_comment_list/1/';

// 获取用户信息
// POST 参数 “f=android&v=8.1&user_smzdm_id=用户 ID” 来获取用户信息
var USER_INFO_JSON = 'https://api.smzdm.com/v1/users/info';

// 获取爆料
// 根据用户 ID 来获取爆料信息
var BAOLIAO_JSON = 'https://api.smzdm.com/v1/users/articles?type=baoliao&limit=9999&get_total=1&f=android&v=8.1&user_smzdm_id=';

// 每页评论数
var COMMENTS_PER_PAGE = 10;

// 最大爬取历史信息时间(60 天，单位：毫秒)
var MS_MAX_FROM_NOW = 60 * 24 * 3600 * 1000;

Date.prototype.Format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"H+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S": this.getMilliseconds()
	};

	if (/(y+)/.test(fmt))
	{
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for (var k in o)
	{
		if (new RegExp("(" + k + ")").test(fmt))
		{
			fmt = fmt.replace(RegExp.$1,
				(RegExp.$1.length == 1) ?
					(o[k]) :
					(("00" + o[k]).substr(("" + o[k]).length)));
		}
	}

	return fmt;
}

function get_now()
{
	return new Date().Format('yyyy-MM-dd HH:mm:ss');
}

function analy_baoliao(str_baoliao)
{
	var now = get_now();
	var baoliao_obj = JSON.parse(str_baoliao);

	for (var i = 0; i < baoliao_obj.data.rows.length; i++)
	{
		var baoliao_info = baoliao_obj.data.rows[i];
		console.info('%s http://www.smzdm.com/p/%d/ 爆料人：%s\t商城：%s\t价格：%s\t标题：%s',
			now,
			baoliao_info.article_id,
			baoliao_info.article_author,
			baoliao_info.article_mall,
			baoliao_info.article_price,
			baoliao_info.article_title);
	}
}

function analy_user_info(str_user_info, user_smzdm_id)
{
	var now = get_now();
	var user_info_obj = JSON.parse(str_user_info);

	if (0 == user_info_obj.data.articles.baoliao)
	{
		// console.warn('%s 用户 %s(%d) 没有任何爆料信息！', now, user_info_obj.data.display_name, user_smzdm_id);
		return;
	}

	// 获取用户爆料信息
	// console.info('%s 获取用户 %s(%d) 的爆料信息（共 %d 项）...',
		// now,
		// user_info_obj.data.display_name,
		// user_smzdm_id,
		// user_info_obj.data.articles.baoliao);
	get_page(4, BAOLIAO_JSON + user_smzdm_id);
}

function analy_comment(str_comment)
{
	var now = get_now();
	var comment_obj = JSON.parse(str_comment);
	var cur_post_id = parseInt(comment_obj.post_id);

	// 获取本页评论里用户的爆料数量
	for (var i = 0; i < comment_obj.data.length; i++)
	{
		// 获取评论用户信息
		var user_smzdm_id = comment_obj.data[i].user_smzdm_id;
		// console.info('%s 获取用户 %d 的信息...', now, user_smzdm_id);
		get_page(3, USER_INFO_JSON, { 'f' : 'android', 'v' : '8.1', 'user_smzdm_id' : user_smzdm_id });
	}

	var cur_page = parseInt(comment_obj.page_no);
	var total_pages = Math.floor(comment_obj.total_num / COMMENTS_PER_PAGE) + 1;
	if (cur_page >= total_pages)
	{
		// console.warn('%s 爆料 %d 的所有评论信息已全部获取！', now, comment_obj.post_id);
		return;
	}

	// 获取下一页评论
	// console.info('%s 继续获取爆料 %d 的第 %d 页评论信息...', now, cur_post_id, cur_page + 1);
	get_page(2, COMMENT_JSON + cur_post_id, { 'page_no' : cur_page + 1 });
}

function analy_page(str_page)
{
	var now = get_now();
	var page_obj = JSON.parse(str_page);

	var arr_pages = page_obj.data.match(/https:\/\/m.smzdm.com\/p\/\d+\/[^]+?\>\d+\<\/span\>/gm);
	for (var i = 0; i < arr_pages.length; i++)
	{
		var item_info = arr_pages[i].match(/https:\/\/m.smzdm.com\/p\/(\d+)\/[^]+?\>(\d+)\<\/span\>/im);
		if (item_info.length >= 3 &&
			item_info[2] > 0) // 评论数大于 0
		{
			// 获取第一页评论
			// console.info('%s 开始获取爆料 %d 的评论信息(评论数：%d)...', now, item_info[1], item_info[2]);
			get_page(2, COMMENT_JSON + item_info[1], { 'page_no' : 1 });
		}
	}

	var now_ms = Date.parse(now);
	var art_ms = Date.parse(page_obj.article_date);
	if (now_ms - art_ms >= MS_MAX_FROM_NOW)
	{
		console.warn('%s “发现”频道所有页面的爬取已完成！', now);
		return;
	}

	// 获取“发现”频道下一个页面
	// console.info('%s 继续获取 %s 之前的页面...', now, page_obj.article_date);
	get_page(1, FAXIAN_JSON + encodeURIComponent(page_obj.article_date));
}

function get_page(step, url, data)
{
	var req = null;
	switch (step)
	{
		case 1: // 获取“发现”频道页面
		case 4: // 获取用户爆料信息
			req = request.get(url);
			break;

		case 2: // 获取评论信息
		case 3: // 获取用户信息
			req = request.post({ 'url' : url, 'form' : data });
			break;
	}

	if (null == req)
	{
		return;
	}

	req.on('response', function (res) {
		var buf_parts = [];
		res.on('end', function () {
			var str_res = unescape(Buffer.concat(buf_parts).toString().replace(/\\(u[0-9a-fA-F]{4})/gm, '%$1'));
			switch (step)
			{
				case 1:
					analy_page(str_res);
					break;

				case 2:
					analy_comment(str_res);
					break;

				case 3:
					analy_user_info(str_res, data.user_smzdm_id);
					break;

				case 4:
					analy_baoliao(str_res);
					break;
			}
		})
		.on('data', function (chunk) { buf_parts.push(chunk); })
		.on('error', function () { console.error('%s 有错误发生在获取页面响应，url = %s', get_now(), url); });
	})
	.on('error', function () { console.error('%s 有错误发生在页面请求，url = %s', get_now(), url); });
}

// 获取“发现”频道第一个页面
get_page(1, FAXIAN_JSON + encodeURIComponent(get_now()));
