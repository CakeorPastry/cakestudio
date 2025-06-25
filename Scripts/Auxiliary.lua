local AuxiliaryModule = {}

function AuxiliaryModule.randomString() 
    local length = math.random(10, 20)
    local array = {}
    for i = 1, length do
        array[i] = string.char(math.random(32, 126))
    end

    return table.concat(array)
end

return AuxiliaryModule