$ = jQuery

defaultOptions = 
    url: "http://leads.events.dubrovskiy.me/api/"
    landingSplit: null
    productId: null
    price: null
    shippingCost: null
    phone: null
    phoneObject: null
    phoneSelector: ""
    name: null
    nameObject: null
    nameSelector: ""
    address: null
    addressObject: null
    addressSelector: ""
    city: null
    cityObject: null
    citySelector: ""
    country: null
    countryObject: null
    countrySelector: ""
    secondPhone: null
    secondPhoneObject: null
    secondPhoneSelector: ""
    parameters: {}
    sendOnClick: false
    redirect: false
    redirectUrl: ""
    getApidFromUrl: false
    regexApidFromUrl: /\?apid=([0-9-]+)\&?/i
    blocking: true
    blockingMessage: "<h4><img src='/images/busy.gif' />&nbsp;Пожалуйста подождите...</h4>"
    onInvalid: (validation) -> alert data.msg for data in validation
    onSuccess: null
    onError: (errors) -> 
        if errors && errors.ModelState
            message = ""
            $.each errors.ModelState, (key, msg) ->
                message += "#{key} : #{msg[0]}\n";
            alert message
        else
            alert "Ошибка при выполнение запроса"

methods = 

    init: (element, options) ->

        if not @timer 
            @timer = 0        
            setInterval (=> @timer++), 1000
            
        $.error "Необходимо подключить библиотеку jquery.blockUI.js или выключить опцию blocking" if options.blocking is true and not $.blockUI

        element.click -> methods.sendRequest element, options if options.sendOnClick is true

    build: (element, options) ->

        phoneBox = if options.phoneObject then $(options.phoneObject) else (if options.phoneSelector then $(options.phoneSelector) else null)
        nameBox = if options.nameObject then $(options.nameObject) else (if options.nameSelector then $(options.nameSelector) else null)
        addressBox = if options.addressObject then $(options.addressObject) else (if options.addressSelector then $(options.addressSelector) else null)
        cityBox = if options.cityObject then $(options.cityObject) else (if options.citySelector then $(options.citySelector) else null)
        countryBox = if options.countryObject then $(options.countryObject) else (if options.countrySelector then $(options.countrySelector) else null)
        secondPhoneBox = if options.secondPhoneObject then $(options.secondPhoneObject) else (if options.secondPhoneSelector then $(options.secondPhoneSelector) else null)
        

        apid: if options.getApidFromUrl is true then @getApidFromUrl element, options else 0
        phoneElement: phoneBox
        phone: if options.phone isnt null then options.phone else (if phoneBox then phoneBox.val() else '')
        nameElement: nameBox
        name: if options.name isnt null then options.name else (if nameBox then nameBox.val() else '')
        addressElement: addressBox
        address: if options.address isnt null then options.address else (if addressBox then addressBox.val() else '')
        cityElement: cityBox
        city: if options.city isnt null then options.city else (if cityBox then cityBox.val() else '')
        countryElement: countryBox
        country: if options.country isnt null then options.country else (if countryBox then countryBox.val() else '')
        secondPhoneElement: secondPhoneBox
        secondPhone: if options.secondPhone isnt null then options.secondPhone else (if secondPhoneBox then secondPhoneBox.val() else '')

    validate: (element, options, model) ->

        errors = []

        if model.apid is null

            if not model.phone or model.phone is ''
                errors.push 
                    obj: model.phoneElement
                    msg: "Телефон обязателен для заказа" 

            if not model.name or model.name is ''
                errors.push 
                    obj: model.nameElement
                    msg: "Имя обязателеное поле для заказа" 

            if not options.landingSplit
                errors.push 
                    obj: null
                    msg: "Код варианта лендинга не указан в заказе" 

            if not options.productId
                errors.push 
                    obj: null
                    msg: "Внешнний код продукта не указан в заказе" 

        errors


    sendRequest: (element, options) ->

        model = @build element, options
        
        errors = @validate element, options, model

        if errors.length > 0
            options.onInvalid errors
            return

        $.blockUI message: options.blockingMessage if options.blocking is true

        $.ajax 
            url: "#{options.url}Lead"
            type: 'POST'
            data: JSON.stringify
                id: model.apid
                phone: model.phone
                name: model.name
                address: model.address
                country: model.country
                city: model.city
                secondPhone: model.secondPhone
                landingSplit: options.landingSplit
                productId: options.productId
                price: options.price
                shippingCost: options.shippingCost
                timer: @timer
                queryString: window.location.href
                referrer: document.referrer
                parameters: options.parameters
            dataType: 'json'
            contentType: 'application/json'
            success: (response) -> 
                options.onSuccess response if options.onSuccess and response
                $.unblockUI() if options.blocking is true
                document.location = options.redirectUrl.replace("{#APID}", response) if options.redirect is true
            error: (response) ->
                $.unblockUI() if options.blocking is true
                if response and response.responseText
                    options.onError jQuery.parseJSON(response.responseText)
                else
                    alert "Ошибка при выполнение запроса"

    getApidFromUrl: (element, options) ->

        matches = window.location.href.match(options.regexApidFromUrl);
        matches[1] if matches and matches.length > 1

        
$.fn.leadAPI = (method, arg) ->

    if method of methods
        result = new Array()
        $(this).each (i, el) ->
            $el = $(el)
            $.error "Function leadAPI() does not exist for #{el} object." if !$el.data("options")
            options = $.extend({}, $el.data("options"), arg)
            $el.data "options", options
            result[i] = methods[method] $el, options, arguments, 1
        return result

    if typeof method is 'object' or !method
        $(this).each (i, el) ->
            $el = $(el)
            options= $.extend({}, defaultOptions, $el.data("options"), method)
            $el.data "options", options
            methods.init $el, options
            return
        return

    $.error "Method #{method} does not exist on jQuery.leadAPI"
