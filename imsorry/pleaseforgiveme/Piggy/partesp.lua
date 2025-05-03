--[[ /imsorry/pleaseforgiveme/Piggy/partesp.lua ]]

local player = game.Players.LocalPlayer
local runService = game:GetService("RunService")
local playerGui = player:WaitForChild("PlayerGui")
local TweenService = game:GetService("TweenService")
local TweenInfoSetting = TweenInfo.new(1, Enum.EasingStyle.Linear)

function randomString()
    local length = math.random(10, 20)
    local array = {}
    for i = 1, length do
        array[i] = string.char(math.random(32, 126))
    end
    return table.concat(array)
end

function PlaySound(id)
    --[[
9070284921 - Beautiful Girls (LOUD) (SHORT)
97495881842727 - DO NOT REDEEM
6204175492 - ara ara 2
7784389087 - DJ Snake - YAMH
7510781592 - slap oh
80959855784919 - Man screaming meme sound effect

]]  

    local table = {
        9070284921,
        97495881842727,
        6204175492,
        7784389087,
        7510781592,
        80959855784919
    }
    local Sound = Instance.new("Sound")
    local finalId = id or table[math.random(1, #table)]
    Sound.SoundId = "rbxassetid://" .. finalId
    Sound.Parent = workspace
    Sound:Play()
    Sound.Ended:Wait()
    Sound:Destroy()
end

function CreateNotification(text, color, duration)
    local notification = Instance.new("TextLabel")
    notification.Size = UDim2.new(1, 0, 1, 0)
    notification.TextColor3 = color or Color3.new(1, 1, 1)
    notification.BackgroundTransparency = 1
    notification.TextSize = 20
    notification.Text = text
    notification.TextTransparency = 0
    notification.TextScaled = true
    notification.Parent = screenGui.Output
    task.spawn(function() PlaySound("9102731048") end)
    task.wait(duration or 5)
    local destroyTween = TweenService:Create(notification, TweenInfoSetting, { TextTransparency = 1 })
    destroyTween:Play()
    destroyTween.Completed:Wait()
    notification:Destroy()
end

-- Game check
if game.GameId ~= 1516533665 then
    CreateNotification("This script is only for the game \"Piggy\".", Color3.new(1, 0, 0), 5)
    PlaySound()
    return
end

-- Prevent duplicate run
if imsorry_pleaseforgiveme_Piggy_partesp_lua_LOADED then
    CreateNotification("Script is already running!", Color3.new(1, 0, 0), 5)
    pcall(function() imsorry_pleaseforgiveme_Piggy_partesp_lua_frame.Position = UDim2.new(0, 10, 0.5, -40) end)
    error("/imsorry/pleaseforgiveme/Piggy/partesp.lua is already running!", 0)
    return
end
getgenv().imsorry_pleaseforgiveme_Piggy_partesp_lua_LOADED = true

-- GUI setup
local screenGui = Instance.new("ScreenGui", game.CoreGui)
screenGui.Name = randomString()
screenGui.ResetOnSpawn = false

local notificationFrame = Instance.new("Frame")
notificationFrame.Size = UDim2.new(0, 626, 0, 59)
notificationFrame.Position = UDim2.new(0.5, 0, 0.268, 0)
notificationFrame.AnchorPoint = Vector2.new(0.5, 0.5)
notificationFrame.BackgroundTransparency = 1
notificationFrame.Name = "Output"
notificationFrame.Parent = screenGui

local gridLayout = Instance.new("UIGridLayout")
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.CellSize = UDim2.new(1, 0, 0.35, 0)
gridLayout.Parent = notificationFrame

local frame = Instance.new("Frame", screenGui)
frame.Size = UDim2.new(0, 160, 0, 100)
frame.Position = UDim2.new(0, 10, 0.5, -50)
frame.BackgroundColor3 = Color3.new(0.1, 0.1, 0.1)
frame.Active = true
frame.Draggable = true
getgenv().imsorry_pleaseforgiveme_Piggy_partesp_lua_frame = frame

local mainButton = Instance.new("TextButton", frame)
mainButton.Size = UDim2.new(1, -10, 0, 30)
mainButton.Position = UDim2.new(0, 5, 0, 5)
mainButton.Text = "Main: OFF"
mainButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
mainButton.TextColor3 = Color3.new(1, 1, 1)

local allButton = Instance.new("TextButton", frame)
allButton.Size = UDim2.new(1, -10, 0, 30)
allButton.Position = UDim2.new(0, 5, 0, 40)
allButton.Text = "All: OFF"
allButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
allButton.TextColor3 = Color3.new(1, 1, 1)

local mainEnabled, allEnabled = false, false
local billboardFolder = Instance.new("Folder", screenGui)
billboardFolder.Name = "ESP_Billboards"

local highlightFolder = Instance.new("Folder", screenGui)
highlightFolder.Name = "ESP_Highlights"

local cachedNames = {}

local function isFolderMatch(name)
    return name:gsub("[%d%-]", "") == ""
end

local function isAllMatch(name)
    return name:match("^%d+$")
end

local function hasItemScript(obj)
    return obj:FindFirstChild("ItemPickupScript") and obj.ItemPickupScript:IsA("Script")
end

local function applyESP(obj)
    if not obj:IsA("BasePart") then return end
    local uid = obj:GetDebugId(5)

    -- Highlight
    if not highlightFolder:FindFirstChild(uid) then
        local h = Instance.new("Highlight")
        h.Name = uid
        h.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
        h.FillColor = hasItemScript(obj) and Color3.fromRGB(0, 255, 0) or Color3.fromRGB(255, 0, 0)
        h.OutlineColor = Color3.new(1, 1, 1)
        h.Adornee = obj
        h.Parent = highlightFolder
    end

    -- Billboard GUI
    local billboard = billboardFolder:FindFirstChild(uid)
    if not billboard then
        billboard = Instance.new("BillboardGui")
        billboard.Name = uid
        billboard.Size = UDim2.new(0, 100, 0, 25)
        billboard.AlwaysOnTop = true
        billboard.StudsOffset = Vector3.new(0, 2, 0)
        billboard.Adornee = obj
        billboard.Parent = billboardFolder

        local label = Instance.new("TextLabel")
        label.Size = UDim2.new(1, 0, 1, 0)
        label.BackgroundTransparency = 1
        label.TextColor3 = Color3.new(1, 1, 1)
        label.TextStrokeTransparency = 0
        label.TextScaled = true
        label.Font = Enum.Font.SourceSansBold
        label.Text = obj.Name .. (hasItemScript(obj) and " (Item)" or "")
        label.Name = "NameLabel"
        label.Parent = billboard

        cachedNames[obj] = obj.Name
    else
        local label = billboard:FindFirstChild("NameLabel")
        if label then
            local cur = obj.Name
            if not cur:match("^%d+$") then
                cachedNames[obj] = cur
            end
            label.Text = (cachedNames[obj] or cur) .. (hasItemScript(obj) and " (Item)" or "")
        end
    end
end

local function removeESP()
    highlightFolder:ClearAllChildren()
    billboardFolder:ClearAllChildren()
end

runService.RenderStepped:Connect(function()
    if not (mainEnabled or allEnabled) then return end

    for _, obj in ipairs(workspace:GetDescendants()) do
        if mainEnabled and obj:IsA("Folder") and isFolderMatch(obj.Name) then
            for _, child in ipairs(obj:GetChildren()) do
                applyESP(child)
            end
        end
        if allEnabled and obj:IsA("BasePart") and isAllMatch(obj.Name) then
            applyESP(obj)
        end
    end
end)

mainButton.Activated:Connect(function()
    mainEnabled = not mainEnabled
    mainButton.Text = "Main: " .. (mainEnabled and "ON" or "OFF")
    if not (mainEnabled or allEnabled) then removeESP() end
    CreateNotification("Main ESP " .. (mainEnabled and "Enabled" or "Disabled"), Color3.new(0.5, 0.7, 1), 3)
    PlaySound()
end)

allButton.Activated:Connect(function()
    allEnabled = not allEnabled
    allButton.Text = "All: " .. (allEnabled and "ON" or "OFF")
    if not (mainEnabled or allEnabled) then removeESP() end
    CreateNotification("All ESP " .. (allEnabled and "Enabled" or "Disabled"), Color3.new(1, 0.5, 0.5), 3)
    PlaySound()
end)

CreateNotification("TheFuckBoom is a big nigger monkey.", Color3.new(0, 255, 0), 5)
PlaySound()