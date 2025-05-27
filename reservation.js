$(document).ready(function() {
    let currentCar = null;

    // 1. 获取 vin 参数
    function getVinFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('vin');
    }

    // 2. 渲染车辆信息
    function renderCarInfo(car) {
        if (!car) return;
        currentCar = car;
        $('#car-img').attr('src', car.image || '').attr('alt', car.brand + ' ' + car.model);
        $('#car-title').text(car.brand + ' ' + car.model);
        $('#car-desc').text(car.description || '');
        $('#car-type').text('type: ' + (car.type || ''));
        $('#car-seats').text('seats: ' + (car.seats || 4));
        $('#car-mileage').text('mileage: ' + (car.mileage || '--'));
        $('#car-power').text('power: ' + (car.power || 'petrol'));
        $('#car-availability').text('Availability: ' + (car.available ? car.available : 0));
        $('#car-price').text('price: $' + (car.price || '--') + '/day');
        if (!car.available) {
            $('#reservation-step1').hide();
            $('#car-unavailable-msg').show();
        } else {
            // 设置最大数量
            if (car.available <= 1) {
                $('#quantity').val(1).attr('min', 1).attr('max', 1).prop('disabled', true);
            } else {
                $('#quantity').val(1).attr('min', 1).attr('max', car.available).prop('disabled', false);
            }
            calcTotal();
            $('#reservation-step1').show();
            $('#car-unavailable-msg').hide();
        }
    }

    // 3. 计算总价
    function calcTotal() {
        if (!currentCar) return $('#total-price').text('0.00');
        const price = Number(currentCar.price) || 0;
        const quantity = Number($('#quantity').val()) || 1;
        const start = $('#start-date').val();
        const end = $('#end-date').val();
        let days = 0;
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            days = Math.floor((endDate - startDate) / (1000*60*60*24)) + 1;
            if (days < 1) days = 0;
        }
        const total = days > 0 ? (days * price * quantity) : 0;
        $('#total-price').text(total.toFixed(2));
    }

    // 4. 监听表单变化
    $('#start-date, #end-date, #quantity').on('change input', function() {
        calcTotal();
    });

    // 5. 主流程
    const vin = getVinFromUrl();
    if (!vin) {
        $('#reservation-step1, #reservation-step2, #reservation-step3, #reservation-step4, #car-unavailable-msg').hide();
        $('#no-car-selected-msg').show();
        return;
    }
    $.get('/api/cars', function(cars) {
        if (!Array.isArray(cars)) return;
        const car = cars.find(c => c.vin === vin);
        renderCarInfo(car);
    });

    // 6. NEXT 按钮
    $('#next-btn').on('click', function() {
        // 校验
        const start = $('#start-date').val();
        const end = $('#end-date').val();
        const quantity = Number($('#quantity').val());
        if (!start || !end) {
            alert('Please select start and end date.');
            return;
        }
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (endDate < startDate) {
            alert('End date must be after start date.');
            return;
        }
        if (quantity < 1) {
            alert('Quantity must be at least 1.');
            return;
        }
        // 切换到第二步
        $('#reservation-step1').hide();
        $('#reservation-step2').show();
        $('#step1-label').removeClass('active');
        $('#step2-label').addClass('active');
    });

    // 7. CANCEL 按钮
    $('#cancel-btn, #cancel2-btn').on('click', function() {
        window.location.href = 'index.html';
    });

    // 8. BACK 按钮
    $('#back-btn').on('click', function() {
        $('#reservation-step2').hide();
        $('#reservation-step1').show();
        $('#step2-label').removeClass('active');
        $('#step1-label').addClass('active');
    });

    // 实时校验函数
    function validateName(val) {
        if (!val) return 'Name is required.';
        if (val.length < 2) return 'Name is too short.';
        return '';
    }
    function validatePhone(val) {
        if (!val) return 'Mobile number is required.';
        if (!/^\d{6,}$/.test(val)) return 'Enter a valid phone number.';
        return '';
    }
    function validateEmail(val) {
        if (!val) return 'Email is required.';
        if (!/^\S+@\S+\.\S+$/.test(val)) return 'Enter a valid email.';
        return '';
    }
    function validateLicense(val) {
        if (!val) return 'Driver license is required.';
        if (val.length < 4) return 'License number is too short.';
        return '';
    }
    function checkFormValidity() {
        const name = $('#user-name').val().trim();
        const phone = $('#user-phone').val().trim();
        const email = $('#user-email').val().trim();
        const license = $('#user-license').val().trim();
        const v1 = validateName(name);
        const v2 = validatePhone(phone);
        const v3 = validateEmail(email);
        const v4 = validateLicense(license);
        return !(v1 || v2 || v3 || v4);
    }
    function updatePlaceOrderBtn() {
        if (checkFormValidity()) {
            $('#place-order-btn').prop('disabled', false);
        } else {
            $('#place-order-btn').prop('disabled', true);
        }
    }
    // 绑定实时校验
    $('#user-name').on('input', function() {
        const val = $(this).val().trim();
        const msg = validateName(val);
        if (msg) {
            $(this).addClass('input-error').removeClass('input-valid');
            $('#feedback-name').text(msg).removeClass('valid');
        } else {
            $(this).addClass('input-valid').removeClass('input-error');
            $('#feedback-name').text('Looks good!').addClass('valid');
        }
        updatePlaceOrderBtn();
    });
    $('#user-phone').on('input', function() {
        const val = $(this).val().trim();
        const msg = validatePhone(val);
        if (msg) {
            $(this).addClass('input-error').removeClass('input-valid');
            $('#feedback-phone').text(msg).removeClass('valid');
        } else {
            $(this).addClass('input-valid').removeClass('input-error');
            $('#feedback-phone').text('Looks good!').addClass('valid');
        }
        updatePlaceOrderBtn();
    });
    $('#user-email').on('input', function() {
        const val = $(this).val().trim();
        const msg = validateEmail(val);
        if (msg) {
            $(this).addClass('input-error').removeClass('input-valid');
            $('#feedback-email').text(msg).removeClass('valid');
        } else {
            $(this).addClass('input-valid').removeClass('input-error');
            $('#feedback-email').text('Looks good!').addClass('valid');
        }
        updatePlaceOrderBtn();
    });
    $('#user-license').on('input', function() {
        const val = $(this).val().trim();
        const msg = validateLicense(val);
        if (msg) {
            $(this).addClass('input-error').removeClass('input-valid');
            $('#feedback-license').text(msg).removeClass('valid');
        } else {
            $(this).addClass('input-valid').removeClass('input-error');
            $('#feedback-license').text('Looks good!').addClass('valid');
        }
        updatePlaceOrderBtn();
    });
    // 初始禁用下单按钮
    $('#place-order-btn').prop('disabled', true);

    // 预填表单
    function prefillUserForm(vin) {
        const data = localStorage.getItem('reservation_' + vin);
        if (data) {
            try {
                const obj = JSON.parse(data);
                if (obj.name) $('#user-name').val(obj.name).trigger('input');
                if (obj.phone) $('#user-phone').val(obj.phone).trigger('input');
                if (obj.email) $('#user-email').val(obj.email).trigger('input');
                if (obj.license) $('#user-license').val(obj.license).trigger('input');
            } catch {}
        }
    }
    // 输入时保存
    function saveUserForm(vin) {
        const obj = {
            name: $('#user-name').val().trim(),
            phone: $('#user-phone').val().trim(),
            email: $('#user-email').val().trim(),
            license: $('#user-license').val().trim()
        };
        localStorage.setItem('reservation_' + vin, JSON.stringify(obj));
    }
    // 绑定保存事件
    $('#user-name, #user-phone, #user-email, #user-license').on('input', function() {
        if (vin) saveUserForm(vin);
    });
    // 页面加载时预填
    if (vin) prefillUserForm(vin);

    // 9. PLACE ORDER 按钮
    $('#user-form').on('submit', function(e) {
        e.preventDefault();
        // 校验用户信息
        const name = $('#user-name').val().trim();
        const phone = $('#user-phone').val().trim();
        const email = $('#user-email').val().trim();
        const license = $('#user-license').val().trim();
        if (!name || !phone || !email || !license) {
            alert('Please fill in all required fields.');
            return;
        }
        // 组装订单数据
        const order = {
            vin: currentCar.vin,
            car: currentCar.brand + ' ' + currentCar.model,
            startDate: $('#start-date').val(),
            endDate: $('#end-date').val(),
            quantity: Number($('#quantity').val()),
            total: $('#total-price').text(),
            name,
            phone,
            email,
            license,
            createdAt: new Date().toISOString()
        };
        // POST到后端
        $.ajax({
            url: '/api/orders',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(order),
            success: function() {
                // 下单成功后清除localStorage
                if (vin) localStorage.removeItem('reservation_' + vin);
                // 切换到第三步
                $('#reservation-step2').hide();
                $('#reservation-step3').show();
                $('#step2-label').removeClass('active');
                $('#step3-label').addClass('active');
                $('#confirmation-link').html('<span style="color:#1976d2;">Your order has been placed! Please check your email for confirmation link.</span>');
            },
            error: function() {
                alert('Failed to place order. Please try again.');
            }
        });
    });

    // 10. FINISH 按钮
    $('#finish-btn').on('click', function() {
        $('#reservation-step3').hide();
        $('#reservation-step4').show();
    });
}); 