-- Services
local player = game.Players.LocalPlayer
local runService = game:GetService("RunService")
local playerGui = player:WaitForChild("PlayerGui")
local TweenService = game:GetService("TweenService")
local TweenInfoSetting = TweenInfo.new(1, Enum.EasingStyle.Linear)

-- Random string generator
local function randomString()
    local length = math.random(10, 20)
    local array = {}
    for i = 1, length do
        array[i] = string.char(math.random(32, 126))
    end
    return table.concat(array)
end

-- ScreenGui
local screenGui = Instance.new("ScreenGui", game.CoreGui)
screenGui.Name = randomString()
screenGui.ResetOnSpawn = false

-- Notification frame
local notificationFrame = Instance.new("Frame")
notificationFrame.Size = UDim2.new(0, 626, 0, 59)
notificationFrame.Position = UDim2.new(0.5, 0, 0.268415093, 0)
notificationFrame.AnchorPoint = Vector2.new(0.5, 0.5)
notificationFrame.BackgroundTransparency = 1
notificationFrame.Name = "Output"
notificationFrame.Parent = screenGui

local gridLayout = Instance.new("UIGridLayout")
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.StartCorner = Enum.StartCorner.TopLeft
gridLayout.CellPadding = UDim2.new(0, 0, 0, 0)
gridLayout.CellSize = UDim2.new(1, 0, 0.35, 0)
gridLayout.Parent = notificationFrame

-- Sound
local function PlaySound(id)
    local soundIds = {
        9070284921, 97495881842727, 6204175492,
        7784389087, 7510781592, 80959855784919
    }
    local sound = Instance.new("Sound")
    sound.SoundId = "rbxassetid://" .. (id or soundIds[math.random(1, #soundIds)])
    sound.Parent = workspace
    sound:Play()
    sound.Ended:Wait()
    sound:Destroy()
end

-- Notification
local function CreateNotification(text, color, duration)
    local notification = Instance.new("TextLabel")
    notification.Size = UDim2.new(1, 0, 1, 0)
    notification.TextColor3 = color or Color3.new(1, 1, 1)
    notification.BackgroundTransparency = 1
    notification.TextSize = 20
    notification.Text = text
    notification.TextTransparency = 0
    notification.TextScaled = true
    notification.Parent = notificationFrame
    task.spawn(function() PlaySound("9102731048") end)
    task.wait(duration or 5)
    TweenService:Create(notification, TweenInfoSetting, { TextTransparency = 1 }):Play()
    task.wait(1)
    notification:Destroy()
end

-- Game check
if game.GameId ~= 1516533665 then
    CreateNotification("This script is only for Piggy.", Color3.new(1, 0, 0), 5)
    screenGui:Destroy()
    PlaySound()
    return
end

-- Prevent duplicates
if getgenv().PiggyESP_Lua_Running then
    CreateNotification("Script already running!", Color3.new(1, 0, 0), 5)
    return
end
getgenv().PiggyESP_Lua_Running = true

-- GUI Frame
local frame = Instance.new("Frame", screenGui)
frame.Size = UDim2.new(0, 160, 0, 100)
frame.Position = UDim2.new(0, 10, 0.5, -50)
frame.BackgroundColor3 = Color3.new(0.1, 0.1, 0.1)
frame.Active = true
frame.Draggable = true
frame.Name = "ESPMenu"

-- Buttons
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

-- ESP folders
local espBillboardFolder = Instance.new("Folder", screenGui)
espBillboardFolder.Name = "ESP_Billboards"

local espHighlightFolder = Instance.new("Folder", screenGui)
espHighlightFolder.Name = "ESP_Highlights"

-- Toggle flags
local mainEnabled = false
local allEnabled = false

-- Utility functions
local function isFolderMatch(name)
    return name:gsub("[%d%-]", "") == ""
end

local function isAllMatch(name)
    return name:match("^%d+$")
end

local function hasItemScript(obj)
    return obj:FindFirstChild("ItemPickupScript") and obj.ItemPickupScript:IsA("Script")
end

-- ESP application
local function applyESP(obj)
    if not obj:IsA("BasePart") then return end

    if not obj:FindFirstChild("ESP_Highlight") then
        local highlight = Instance.new("Highlight")
        highlight.Name = "ESP_Highlight"
        highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
        highlight.FillColor = hasItemScript(obj) and Color3.fromRGB(0, 255, 0) or Color3.fromRGB(255, 0, 0)
        highlight.OutlineColor = Color3.new(1, 1, 1)
        highlight.Adornee = obj
        highlight.Parent = espHighlightFolder
    end

    if not espBillboardFolder:FindFirstChild(obj:GetFullName()) then
        local billboard = Instance.new("BillboardGui")
        billboard.Name = obj:GetFullName()
        billboard.Size = UDim2.new(0, 100, 0, 25)
        billboard.AlwaysOnTop = true
        billboard.StudsOffset = Vector3.new(0, 2, 0)
        billboard.Adornee = obj
        billboard.Parent = espBillboardFolder

        local label = Instance.new("TextLabel")
        label.Size = UDim2.new(1, 0, 1, 0)
        label.BackgroundTransparency = 1
        label.TextColor3 = Color3.new(1, 1, 1)
        label.TextStrokeTransparency = 0
        label.TextScaled = true
        label.Font = Enum.Font.SourceSansBold
        label.Text = obj.Name .. (hasItemScript(obj) and " (Item)" or "")
        label.Parent = billboard
    end
end

-- Clear ESP
local function removeESP()
    espBillboardFolder:ClearAllChildren()
    espHighlightFolder:ClearAllChildren()
end

-- ESP logic
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

-- Button logic
mainButton.Activated:Connect(function()
    mainEnabled = not mainEnabled
    mainButton.Text = "Main: " .. (mainEnabled and "ON" or "OFF")
    if not (mainEnabled or allEnabled) then removeESP() end
end)

allButton.Activated:Connect(function()
    allEnabled = not allEnabled
    allButton.Text = "All: " .. (allEnabled and "ON" or "OFF")
    if not (mainEnabled or allEnabled) then removeESP() end
end)

CreateNotification("ESP script loaded successfully.", Color3.new(0, 1, 0), 5)
PlaySound()
