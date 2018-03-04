var budgetController = (function () {
    
    var Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }
    
    Expense.prototype.calculatePercentages = function(totalIncome) {
        if (totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100)    
        } else {
            this.percentage = -1
        }
        
    }
    
    Expense.prototype.getPercentage = function() {
        return this.percentage
    }
    
    var Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }
    
    var calculateTotal = function(type) {
        var sum = 0
        data.allItems[type].forEach(function(current){
            sum = sum + current.value
        })
        data.totals[type] = sum
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return {
        addItem: function (type, des, val){
            var newItem, ID
            
            //new id
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1    
            } else {
                ID = 0
            }
            
            
            //create new item based on income or expense
            if (type === 'exp'){
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val)
            }
            
            //push into data structure
            data.allItems[type].push(newItem)
            
            //return new element
            return newItem
        },
        
        deleteItem: function(type, id) {
            
            var ids, index
            
            ids = data.allItems[type].map(function(current) {
                return current.id
            })
        
            index = ids.indexOf(id) 
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },
        
        calculateBudget: function() {
          
            //calculate total income and expenses
            calculateTotal('exp')
            calculateTotal('inc')
            
            //calculate the budget : inc - exp
            data.budget = data.totals.inc - data.totals.exp
            
            //calculate the percentage of income that we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            }
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(curr){
                curr.calculatePercentages(data.totals.inc)
            })
        },
        
        getPercentages: function() {
            var allperc = data.allItems.exp.map(function(curr) {
                return curr.getPercentage()
            })
            return allperc
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                perc: data.percentage
            }  
        },
        
        testing: function() {
            console.log(data)
        }
        

    }
    
})()


var UIController = (function (){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec, type
            
            num = Math.abs(num)
            num = num.toFixed(2)
            
            numSplit = num.split('.')
            
            int = numSplit[0]
            if (int.length > 3){
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length -3, int.length)
            }
            dec = numSplit[1]
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
    }
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }
    
    return {
        getInput : function() {
            return {
             type: document.querySelector(DOMstrings.inputType).value, //inc or exp
             description: document.querySelector(DOMstrings.inputDescription).value,
             value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            }
            
        },
        
        addListItem: function(obj, type){
           var html, newHtml
            //create html string with placeholder text
           
           if (type === 'inc'){
               element = DOMstrings.incomeContainer
               
               html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' 
               
           } else if (type === 'exp'){
               element = DOMstrings.expensesContainer
               
               html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
               
           }
            //replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))
            
            //insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },
        
        deleteListItem: function(selectorID) {
            var child = document.getElementById(selectorID) 
            child.parentNode.removeChild(child)
        },
        
        
        clearFields: function() {
            var fields, fieldsArr
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)
            
            fieldsArr = Array.prototype.slice.call(fields)
            
            fieldsArr.forEach(function(cur, index, array) {
                cur.value = ""
            })
            
            fieldsArr[0].focus()
        },
        
        displayBudget: function(obj) {
            var type
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type)
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp')
            
            
            if(obj.perc > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.perc + '%'    
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
        },
        
        displayPercentages: function(percentages) {
          
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel)
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '---'
                }
            })  
        },
        
        displayMonth: function() {
            var now, year, month, months
            
            now = new Date()
            month = now.getMonth()
            months = ['January', 'February', 'March', 'May', 'July', 'August', 'September', 'October', 'November', 'December']
            year = now.getFullYear()
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year
        },
        
        changedType: function() {
            var fields
            
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue)
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus')
            })
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },
        
        getDOMstrings : function() {
            return DOMstrings
        }
    }
    
}) ()


//global
var controller = (function (budgetController, UIController){
    
    var setupEventListeners = function () {
        var DOM = UIController.getDOMstrings()
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)
    
        document.addEventListener('keypress', function (event) {
    
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }

        })
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
        
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType)
        
    }
    
   
    var updateBudget = function() {
        //calculate the budget
        budgetController.calculateBudget()
        
        //return budget
        var budget = budgetController.getBudget()
        
        //display budget
        UIController.displayBudget(budget)
    }
    
    var updatePercentages = function() {
        
        //calculate percentages
        budgetController.calculatePercentages()
        
        //read percentages from the budget controller
        var percentages = budgetController.getPercentages()
        
        //update the ui with new percentages
        UIController.displayPercentages(percentages)
    }
    
    var ctrlAddItem = function () {
        var input, newItem
        
        //get input data
        input = UIController.getInput();
      
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //add the item to budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value)

            //add the item to ui
            UIController.addListItem(newItem, input.type)
            
            //clear the fields
            UIController.clearFields()
            
            //update budget
            updateBudget()
        
            //calculate and update percentages
            updatePercentages()
        }
    }
    
    var ctrlDeleteItem = function(event) {
        var itemId, splitID, type, ID
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemId) {
            
            //inc-1
            splitID = itemId.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])
            
            //delete the item f rom the data structure
            budgetController.deleteItem(type, ID)
            
            //delete the item from the ui
            UIController.deleteListItem(itemId)
            
            //update the budget
            updateBudget()
            
            //calculate and update percentages
            updatePercentages()
        }
    }
    
    return {
        init: function (){
            console.log('app started')
            UIController.displayMonth()
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                perc: -1
            })
            setupEventListeners()
        }
    }
    

})(budgetController, UIController)


controller.init()