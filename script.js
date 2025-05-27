$(document).ready(function() {
    console.log("网站加载完成！");
    // 这里将添加更多代码

    let allCars = [];
    let selectedType = '';
    let selectedBrand = '';

    // 加载并渲染所有车辆
    function loadCars() {
        $.get('/api/cars', function(cars) {
            if (!Array.isArray(cars)) cars = [];
            allCars = cars;
            renderCars(filterCars(allCars));
        });
    }

    // 根据筛选条件过滤车辆
    function filterCars(cars) {
        if (!Array.isArray(cars)) return [];
        const keyword = $('#search-box').val().trim().toLowerCase();
        return cars.filter(car => {
            let match = true;
            if (selectedType && car.type !== selectedType) match = false;
            if (selectedBrand && car.brand !== selectedBrand) match = false;
            if (keyword) {
                const str = `${car.brand} ${car.model} ${car.type} ${car.description}`.toLowerCase();
                if (!str.includes(keyword)) match = false;
            }
            return match;
        });
    }

    // 渲染车辆到网格
    function renderCars(cars) {
        const $grid = $('#car-grid');
        $grid.empty();
        if (!Array.isArray(cars) || cars.length === 0) {
            $grid.append('<p>No cars found.</p>');
            return;
        }
        cars.forEach(car => {
            // 统一可用性判断
            const isAvailable = (typeof car.available === 'number') ? car.available > 0 : !!car.available;
            const disabled = isAvailable ? '' : 'disabled';
            const btnText = isAvailable ? 'RESERVE' : 'Unavailable';
            $grid.append(`
                <div class="car-card">
                    <img src="${car.image}" alt="${car.brand} ${car.model}">
                    <h3>${car.brand} ${car.model}</h3>
                    <div class="car-desc">${car.description || ''}</div>
                    <div class="car-details">
                        <div>type: ${car.type}</div>
                        <div>seats: ${car.seats || 4}</div>
                        <div>mileage: ${car.mileage || '--'}</div>
                        <div>power: ${car.power || 'petrol'}</div>
                        <div>Availability: ${isAvailable ? car.available : 0}</div>
                        <div>price: <span class="car-price">$${car.price}</span><span class="car-day">/day</span></div>
                    </div>
                    <button class="rent-btn" data-vin="${car.vin}" ${disabled}>${btnText}</button>
                </div>
            `);
        });

        // 事件委托：点击rent-btn跳转到reservation.html?vin=xxx
        $(document).on('click', '.rent-btn', function() {
            const vin = $(this).data('vin');
            if (vin) {
                window.location.href = `reservation.html?vin=${vin}`;
            }
        });
    }

    // 搜索建议功能
    function getSuggestions(keyword, cars) {
        if (!keyword) return [];
        keyword = keyword.toLowerCase();
        const suggestions = new Set();
        cars.forEach(car => {
            [car.brand, car.model, car.type, car.description].forEach(field => {
                if (field && field.toLowerCase().includes(keyword)) {
                    field.split(/\s+/).forEach(word => {
                        if (word.toLowerCase().includes(keyword)) suggestions.add(word);
                    });
                }
            });
        });
        return Array.from(suggestions).filter(s => s.length > 1).slice(0, 8);
    }

    $('#search-box').on('input', function() {
        const keyword = $(this).val().trim();
        const suggestions = getSuggestions(keyword, allCars);
        const $suggestions = $('#search-suggestions');
        if (suggestions.length > 0 && keyword) {
            $suggestions.html(suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('')).show();
        } else {
            $suggestions.hide();
        }
        renderCars(filterCars(allCars));
    });

    // 点击建议项自动补全并搜索
    $(document).on('mousedown', '.suggestion-item', function(e) {
        e.preventDefault();
        const text = $(this).text();
        $('#search-box').val(text);
        $('#search-suggestions').hide();
        renderCars(filterCars(allCars));
    });

    // 失焦时隐藏建议
    $('#search-box').on('blur', function() {
        setTimeout(() => { $('#search-suggestions').hide(); }, 150);
    });

    // 导航栏品牌筛选
    $(document).on('click', '.dropdown-content a[data-brand]', function(e) {
        e.preventDefault();
        const brand = $(this).data('brand');
        selectedBrand = brand === 'All' ? '' : brand;
        renderCars(filterCars(allCars));
    });

    // 导航栏类型筛选
    $(document).on('click', '.dropdown-content a[data-type]', function(e) {
        e.preventDefault();
        const type = $(this).data('type');
        selectedType = type === 'All' ? '' : type;
        renderCars(filterCars(allCars));
    });

    // 可选：添加"全部"选项
    // 你可以在 HTML 下拉菜单中添加 <a href="#" data-type="All">All Types</a> 和 <a href="#" data-brand="All">All Brands</a>

    // 初始加载所有车辆
    loadCars();
});